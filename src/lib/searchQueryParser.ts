import {
  SECTOR_INTEREST_LABELS,
  UT_SCHOOLS_AND_PROGRAMS,
} from "@/lib/utSchoolsAndMajors";
import type { DashboardFilters } from "@/lib/dashboardFilters";

export type ParsedQuery = {
  filters: Partial<DashboardFilters>;
  semanticQuery: string;
  ftsTerms: string[];
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_TIMEOUT_MS = 1500;
const CACHE_MAX = 1000;
const CACHE_TTL_MS = 60 * 60 * 1000;

type CacheEntry = { value: ParsedQuery; expiresAt: number };
const cache = new Map<string, CacheEntry>();

function cacheGet(key: string): ParsedQuery | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  cache.delete(key);
  cache.set(key, entry);
  return entry.value;
}

function cacheSet(key: string, value: ParsedQuery) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function safeFallback(q: string): ParsedQuery {
  return { filters: {}, semanticQuery: q, ftsTerms: [] };
}

function buildSystemPrompt(currentYear: number): string {
  const collegeKeys = Object.keys(UT_SCHOOLS_AND_PROGRAMS);
  const sectorKeys = Object.keys(SECTOR_INTEREST_LABELS);
  const collegeLabels = collegeKeys
    .map(
      (k) =>
        `${k} (${UT_SCHOOLS_AND_PROGRAMS[k as keyof typeof UT_SCHOOLS_AND_PROGRAMS].label})`,
    )
    .join(", ");
  const sectorLabels = sectorKeys
    .map((k) => `${k} (${SECTOR_INTEREST_LABELS[k as keyof typeof SECTOR_INTEREST_LABELS]})`)
    .join(", ");

  return `You parse a user's natural-language search query for a UT Austin co-founder matching app and emit a strict JSON object.

Output JSON keys:
- "filters": object with optional keys "college", "sectors", "gradYear", "intent".
  - "college": exactly one of these keys: ${collegeLabels}. Only set if the query explicitly names a school/department. A skill, job title, or field of expertise (e.g. "statistics expert", "designer", "ML engineer") is NOT a school name — never infer college from a skill.
  - "sectors": array of one or more of these keys: ${sectorLabels}. Only include sectors the query explicitly mentions or strongly implies by industry name.
  - "gradYear": integer between ${currentYear - 6} and ${currentYear + 6}. Only set if the query explicitly mentions a graduation year (e.g. "class of 2026", "graduating 2025"). For "current senior" or "incoming freshman", do NOT guess a year.
  - "intent": "join_me" (looking for someone to join their startup) or "seeking_to_join" (wants to join someone else's startup). Only set if the query is explicitly about this distinction.
- "semanticQuery": a cleaned version of the query suitable for semantic embedding — drop the parts that became filters, keep the meaning-bearing words. If the query is purely structural ("class of 2026"), return an empty string.
- "ftsTerms": array of expanded keyword synonyms for full-text search. Include the original meaningful words plus 2-6 related terms / synonyms / spelled-out abbreviations. Max 10 terms. Empty array if no useful keywords.

HARD RULES:
1. If the query does NOT explicitly reference a filter dimension, OMIT that key entirely. False positives are worse than false negatives.
2. Use ONLY enum keys from the lists above. Never invent new values.
3. Preserve negations and qualifiers ("non-technical", "not in fintech") in semanticQuery — do not flip them into positive filters.
4. Return ONLY the JSON object. No markdown, no commentary.

Examples:
Input: "ML engineer in fintech graduating 2026"
Output: {"filters":{"sectors":["fintech","ai_ml"],"gradYear":2026},"semanticQuery":"machine learning engineer","ftsTerms":["ML","machine learning","AI","engineer","fintech"]}

Input: "McCombs MBA looking for technical co-founder"
Output: {"filters":{"college":"mccombs_business","intent":"seeking_to_join"},"semanticQuery":"MBA student seeking technical co-founder","ftsTerms":["MBA","business","technical","co-founder"]}

Input: "non-technical founder with sales chops"
Output: {"filters":{},"semanticQuery":"non-technical founder with sales experience","ftsTerms":["non-technical","sales","business development","founder"]}

Input: "interesting people"
Output: {"filters":{},"semanticQuery":"interesting people","ftsTerms":[]}

Input: "statistics expert graduating in 2027"
Output: {"filters":{"gradYear":2027},"semanticQuery":"statistics expert","ftsTerms":["statistics","data","analytics","quantitative"]}`;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validateParsed(raw: unknown, q: string, currentYear: number): ParsedQuery {
  const result: ParsedQuery = { filters: {}, semanticQuery: q, ftsTerms: [] };
  if (!isRecord(raw)) return result;

  if (isRecord(raw.filters)) {
    const f = raw.filters;

    if (
      typeof f.college === "string" &&
      Object.prototype.hasOwnProperty.call(UT_SCHOOLS_AND_PROGRAMS, f.college)
    ) {
      result.filters.college = f.college;
    }

    if (Array.isArray(f.sectors)) {
      const valid = f.sectors.filter(
        (s): s is string =>
          typeof s === "string" &&
          Object.prototype.hasOwnProperty.call(SECTOR_INTEREST_LABELS, s),
      );
      if (valid.length > 0) result.filters.sectors = Array.from(new Set(valid));
    }

    if (typeof f.gradYear === "number" && Number.isInteger(f.gradYear)) {
      if (f.gradYear >= currentYear - 6 && f.gradYear <= currentYear + 6) {
        result.filters.gradYear = f.gradYear;
      }
    }

    if (f.intent === "join_me" || f.intent === "seeking_to_join") {
      result.filters.intent = f.intent;
    }
  }

  if (typeof raw.semanticQuery === "string" && raw.semanticQuery.trim().length > 0) {
    result.semanticQuery = raw.semanticQuery.trim();
  }

  if (Array.isArray(raw.ftsTerms)) {
    result.ftsTerms = raw.ftsTerms
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.trim())
      .slice(0, 10);
  }

  // A year consumed as the gradYear filter must NOT also leak into the
  // semantic/FTS path. graduation_year lives in no search_tsv, so a bare-year
  // query ("2027") would otherwise run a text search for "2027" that matches no
  // profile body and wipes out the correct gradYear-filtered set. Strip the year
  // token from both so a pure-year query takes the pure-filter return path.
  if (typeof result.filters.gradYear === "number") {
    const yearStr = String(result.filters.gradYear);
    result.ftsTerms = result.ftsTerms.filter(
      (t) => t.replace(/\D/g, "") !== yearStr,
    );
    result.semanticQuery = result.semanticQuery
      .replace(new RegExp(`\\b${yearStr}\\b`, "g"), "")
      .replace(/\s+/g, " ")
      .trim();
  }

  return result;
}

export async function parseSearchQuery(q: string): Promise<ParsedQuery> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return safeFallback(q);

  const cacheKey = q.trim().toLowerCase();
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const currentYear = new Date().getFullYear();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.1,
        max_tokens: 512,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildSystemPrompt(currentYear) },
          { role: "user", content: q },
        ],
      }),
    });

    if (!res.ok) return safeFallback(q);

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return safeFallback(q);

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(content);
    } catch {
      return safeFallback(q);
    }

    const validated = validateParsed(parsedJson, q, currentYear);
    cacheSet(cacheKey, validated);
    return validated;
  } catch {
    return safeFallback(q);
  } finally {
    clearTimeout(timer);
  }
}
