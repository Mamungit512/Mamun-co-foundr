import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { mapProfileToOnboardingData } from "@/lib/mapProfileToFromDBFormat";
import { parseSearchQuery, type ParsedQuery } from "@/lib/searchQueryParser";
import {
  type DashboardFilters,
  type RelaxDimension,
  type RelaxSuggestion,
  normalizeDashboardFilters,
} from "@/features/school/data/dashboardFilters";
import {
  getSchoolLabel,
  SECTOR_INTEREST_LABELS,
} from "@/features/school/data/utSchoolsAndMajors";
import { resolveTenantScope } from "@/features/school/auth/tenant-scope";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const EMBED_FN_URL = `${SUPABASE_URL}/functions/v1/embed`;

type CachedParse = {
  /** The original AI-inferred filters, so Mode B can re-merge survivors. */
  filters?: Partial<DashboardFilters>;
  semanticQuery: string;
  ftsTerms: string[];
};

type SearchRequest = {
  q: string;
  /** Page tenant slug; scoping is anchored to this org, validated server-side. */
  org?: string;
  userFilters?: Partial<DashboardFilters>;
  cachedParse?: CachedParse;
  dismissedFilterKeys?: string[];
};

async function getQueryEmbedding(q: string): Promise<number[] | null> {
  if (!q.trim()) return null;
  try {
    const res = await fetch(EMBED_FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ mode: "query", text: q }),
    });

    if (!res.ok) return null;
    const { embedding } = await res.json();
    return embedding ?? null;
  } catch {
    return null;
  }
}

function mergeFilters(
  user: DashboardFilters,
  inferred: Partial<DashboardFilters>,
  dismissed: Set<string>,
): DashboardFilters {
  const merged: DashboardFilters = { ...user };

  if (!merged.college && inferred.college && !dismissed.has("college")) {
    merged.college = inferred.college;
  }
  if (merged.sectors.length === 0 && inferred.sectors && inferred.sectors.length > 0) {
    const kept = inferred.sectors.filter((s) => !dismissed.has(`sector:${s}`));
    if (kept.length > 0) merged.sectors = kept;
  }
  if (merged.gradYear === null && typeof inferred.gradYear === "number" && !dismissed.has("gradYear")) {
    merged.gradYear = inferred.gradYear;
  }
  if (!merged.intent && inferred.intent && !dismissed.has("intent")) {
    merged.intent = inferred.intent;
  }

  return merged;
}

function buildTsquery(terms: string[], fallbackQ: string): string {
  const source = terms.length > 0 ? terms : fallbackQ.split(/\s+/);
  return source
    .map((w) => w.trim().replace(/[^\w]/g, ""))
    .filter((w) => w.length > 0)
    .map((w) => `${w}:*`)
    .join(" | ");
}

async function fetchEligibleUserIds(
  supabase: SupabaseClient,
  userId: string,
  orgId: string,
  filters: DashboardFilters,
): Promise<string[]> {
  const { data: likedProfiles } = await supabase
    .from("likes")
    .select("liked_id")
    .eq("liker_id", userId);
  const likedIds = new Set(likedProfiles?.map((l) => l.liked_id) ?? []);

  let schoolQuery = supabase
    .from("school_profiles")
    .select("user_id")
    .eq("organization_id", orgId);

  if (filters.college) {
    schoolQuery = schoolQuery.eq("college", filters.college);
  }
  if (filters.sectors.length > 0) {
    schoolQuery = schoolQuery.overlaps("sector_interests", filters.sectors);
  }
  if (filters.gradYear !== null) {
    schoolQuery = schoolQuery.eq("graduation_year", filters.gradYear);
  }
  if (filters.intent) {
    schoolQuery = schoolQuery.in("intent", [filters.intent, "no_preference"]);
  }

  const { data: schoolRows } = await schoolQuery;
  const ids = schoolRows?.map((r) => r.user_id) ?? [];

  return ids.filter((id) => id !== userId && !likedIds.has(id));
}

/**
 * Build the `inferred` payload the client renders as chips: the AI-inferred
 * filters that the user did NOT set themselves and did NOT dismiss. Works for
 * both Mode A (fresh Groq parse) and Mode B (cached parse + dismissed keys).
 */
function buildInferredResponse(
  parsedFilters: Partial<DashboardFilters>,
  semanticQuery: string,
  ftsTerms: string[],
  userFilters: DashboardFilters,
  dismissed: Set<string>,
): ParsedQuery {
  const filters: Partial<DashboardFilters> = {};

  if (parsedFilters.college && !userFilters.college && !dismissed.has("college")) {
    filters.college = parsedFilters.college;
  }
  if (parsedFilters.sectors?.length && userFilters.sectors.length === 0) {
    const kept = parsedFilters.sectors.filter(
      (s) => !dismissed.has(`sector:${s}`),
    );
    if (kept.length > 0) filters.sectors = kept;
  }
  if (
    typeof parsedFilters.gradYear === "number" &&
    userFilters.gradYear === null &&
    !dismissed.has("gradYear")
  ) {
    filters.gradYear = parsedFilters.gradYear;
  }
  if (parsedFilters.intent && !userFilters.intent && !dismissed.has("intent")) {
    filters.intent = parsedFilters.intent;
  }

  return { filters, semanticQuery, ftsTerms };
}

const RELAX_DIMENSIONS: RelaxDimension[] = [
  "college",
  "sectors",
  "gradYear",
  "intent",
];

function activeDimensions(f: DashboardFilters): RelaxDimension[] {
  return RELAX_DIMENSIONS.filter((d) => {
    if (d === "sectors") return f.sectors.length > 0;
    return f[d] !== null;
  });
}

function withoutDimension(
  f: DashboardFilters,
  d: RelaxDimension,
): DashboardFilters {
  const next: DashboardFilters = { ...f, sectors: [...f.sectors] };
  if (d === "sectors") next.sectors = [];
  else next[d] = null;
  return next;
}

function relaxLabel(d: RelaxDimension, f: DashboardFilters): string {
  switch (d) {
    case "college":
      return getSchoolLabel(f.college as UTCollege);
    case "sectors":
      return f.sectors
        .map((s) => SECTOR_INTEREST_LABELS[s as UTSectorInterest] ?? s)
        .join(", ");
    case "gradYear":
      return `Class of ${f.gradYear}`;
    case "intent":
      return f.intent === "join_me" ? "Join me" : "Seeking to join";
  }
}

function dismissKeysFor(d: RelaxDimension, f: DashboardFilters): string[] {
  if (d === "sectors") return f.sectors.map((s) => `sector:${s}`);
  return [d];
}

function sourceOf(
  d: RelaxDimension,
  userFilters: DashboardFilters,
): "user" | "inferred" {
  if (d === "sectors") return userFilters.sectors.length > 0 ? "user" : "inferred";
  return userFilters[d] !== null ? "user" : "inferred";
}

/**
 * When a search returns zero candidates purely because of hard filters, probe
 * each active dimension to see how many candidates re-enter if it's dropped.
 * Only relaxations that would actually surface someone are returned. Runs only
 * on the empty path, so the extra (cheap) queries don't affect normal latency.
 */
async function diagnoseRelaxations(
  supabase: SupabaseClient,
  userId: string,
  orgId: string,
  merged: DashboardFilters,
  userFilters: DashboardFilters,
): Promise<RelaxSuggestion[]> {
  const dims = activeDimensions(merged);
  if (dims.length === 0) return [];

  const suggestions = await Promise.all(
    dims.map(async (d) => {
      const relaxed = withoutDimension(merged, d);
      const count = (
        await fetchEligibleUserIds(supabase, userId, orgId, relaxed)
      ).length;
      return {
        dimension: d,
        label: relaxLabel(d, merged),
        source: sourceOf(d, userFilters),
        dismissKeys: dismissKeysFor(d, merged),
        countIfRelaxed: count,
      } satisfies RelaxSuggestion;
    }),
  );

  return suggestions
    .filter((s) => s.countIfRelaxed > 0)
    .sort((a, b) => b.countIfRelaxed - a.countIfRelaxed);
}

async function enrichWithSchoolData(
  supabase: SupabaseClient,
  mapped: OnboardingData[],
  orgId: string,
): Promise<OnboardingData[]> {
  const candidateIds = mapped
    .map((p) => p.user_id)
    .filter((id): id is string => Boolean(id));

  const { data: schoolEnrichRows } = await supabase
    .from("school_profiles")
    .select(
      "user_id, school_status, graduation_year, college, degree_type, major, sector_interests",
    )
    .eq("organization_id", orgId)
    .in("user_id", candidateIds);

  const schoolMap = new Map(
    schoolEnrichRows?.map((row) => [
      row.user_id,
      {
        utStatus: row.school_status,
        gradYear: row.graduation_year,
        utCollege: row.college,
        utDegreeType: row.degree_type,
        utMajor: row.major,
        utSectorInterests: row.sector_interests,
      },
    ]) ?? [],
  );

  return mapped.map((profile) => {
    const school = schoolMap.get(profile.user_id!);
    return school ? { ...profile, ...school } : profile;
  });
}

async function fetchAndEnrichProfiles(
  supabase: SupabaseClient,
  eligibleIds: string[],
  orgId: string,
): Promise<OnboardingData[]> {
  const { data: profilesData, error } = await supabase
    .from("profiles")
    .select("*")
    .in("user_id", eligibleIds)
    .is("deleted_at", null)
    .eq("organization_id", orgId);

  if (error || !profilesData || profilesData.length === 0) return [];

  const mapped = profilesData.map(mapProfileToOnboardingData);
  return enrichWithSchoolData(supabase, mapped, orgId);
}

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as SearchRequest | null;
    if (!body || typeof body.q !== "string") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const q = body.q.trim();
    if (q.length < 2) {
      return NextResponse.json({ profiles: [], inferred: null });
    }

    // Search runs only within a school tenant, anchored to the page's org slug
    // (untrusted, validated server-side). General-pool users and non-members
    // get no results — never another tenant's data.
    const sessionOrgId = sessionClaims?.metadata?.organization_id ?? null;
    const scope = await resolveTenantScope({
      userId,
      sessionOrgId,
      slug: body.org ?? null,
    });
    if (scope.kind !== "org") {
      return NextResponse.json({ profiles: [], inferred: null });
    }
    const orgId = scope.orgId;

    const supabase = await createServerSupabaseClient();
    const userFilters = normalizeDashboardFilters(body.userFilters);
    const dismissed = new Set(body.dismissedFilterKeys ?? []);

    const parsedPromise: Promise<ParsedQuery> = body.cachedParse
      ? Promise.resolve({
          filters: body.cachedParse.filters ?? {},
          semanticQuery: body.cachedParse.semanticQuery,
          ftsTerms: body.cachedParse.ftsTerms,
        })
      : parseSearchQuery(q);

    const [parsed] = await Promise.all([parsedPromise]);

    const mergedFilters = mergeFilters(userFilters, parsed.filters, dismissed);

    // The chips the client renders: AI-inferred filters the user didn't set or
    // dismiss. Computed once and reused across every return path.
    const inferred = buildInferredResponse(
      parsed.filters,
      parsed.semanticQuery,
      parsed.ftsTerms,
      userFilters,
      dismissed,
    );

    const [embedding, eligible] = await Promise.all([
      getQueryEmbedding(parsed.semanticQuery || q),
      fetchEligibleUserIds(supabase, userId, orgId, mergedFilters),
    ]);

    // Hard-filter wall: nobody passes the filters. Offer per-dimension relaxations.
    if (eligible.length === 0) {
      const relaxations = await diagnoseRelaxations(
        supabase,
        userId,
        orgId,
        mergedFilters,
        userFilters,
      );
      return NextResponse.json({
        profiles: [],
        inferred,
        emptyReason: relaxations.length > 0 ? { relaxations } : null,
      });
    }

    // Pure filter query: Groq returned no semantic content worth embedding/FTS-ing.
    // The eligibility filter already identified the right people — just return them.
    const hasSemanticContent =
      parsed.semanticQuery.trim().length > 0 || parsed.ftsTerms.length > 0;

    if (!hasSemanticContent) {
      const enriched = await fetchAndEnrichProfiles(supabase, eligible, orgId);
      return NextResponse.json({ profiles: enriched, inferred, emptyReason: null });
    }

    const tsquery = buildTsquery(parsed.ftsTerms, q);
    if (!tsquery && !embedding) {
      return NextResponse.json({ profiles: [], inferred, emptyReason: null });
    }

    const { data: ranked, error: rpcError } = await supabase.rpc(
      "search_profiles_hybrid",
      {
        eligible_ids: eligible,
        query_text: tsquery || "x",
        query_vec: embedding,
      },
    );

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return NextResponse.json({ profiles: [], inferred, emptyReason: null });
    }

    const matchedIds = (ranked ?? []).map(
      (r: { user_id: string }) => r.user_id,
    );

    if (matchedIds.length === 0) {
      return NextResponse.json({ profiles: [], inferred, emptyReason: null });
    }

    const { data: profilesData, error } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", matchedIds)
      .is("deleted_at", null)
      .eq("organization_id", orgId);

    if (error || !profilesData || profilesData.length === 0) {
      return NextResponse.json({ profiles: [], inferred, emptyReason: null });
    }

    const mapped = profilesData.map(mapProfileToOnboardingData);

    const rankIndex = new Map<string, number>(
      matchedIds.map((id: string, i: number) => [id, i]),
    );
    mapped.sort(
      (a, b) =>
        (rankIndex.get(a.user_id!) ?? 999) - (rankIndex.get(b.user_id!) ?? 999),
    );

    const enriched = await enrichWithSchoolData(supabase, mapped, orgId);
    return NextResponse.json({ profiles: enriched, inferred, emptyReason: null });
  } catch (error) {
    console.error("Error in profiles search API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
