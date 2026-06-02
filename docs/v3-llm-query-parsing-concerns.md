# UT CoFoundr Search — v3 (Phase B): LLM Query Parsing (Concerns & Edge Cases)

This document outlines critical inconsistencies, edge cases, and potential regressions identified in the v3 LLM Query Parsing plan (`on-the-ut-cofoundr-velvet-yeti.md`).

### 1. Inconsistency: Parallel Execution is Architecturally Impossible as Proposed
**The Issue:** Under "Latency mitigation", the plan states the LLM call happens "in parallel with the embedding call". However, in "Step 3 — Hook & dashboard wiring", the flow is strictly sequential: 1) fetch `/api/search/parse`, 2) once it resolves, fetch `/api/profiles/search` passing the `semanticQuery`. The search route cannot embed `semanticQuery` until the parse route returns it.
**The Fix:** You have two options:
- **Sequential (Frontend Orchestrated):** Accept the latency hit. Frontend calls parse, waits, then calls search.
- **Parallel (Backend Orchestrated):** The frontend calls `/api/profiles/search` with raw `q`. The Next.js route calls Groq and the Supabase Edge Function (for embedding) simultaneously using `Promise.all`. The Next.js route performs the filter intersection and returns BOTH the profiles and the `inferredFilters`. The frontend renders the chips from the search response.

### 2. Regression Risk: Groq Free Tier TPM & RPM Limits on Debounced Keystrokes
**The Issue:** The plan relies on a 300ms debounce and estimates 3-5 parse calls per search. Groq's free tier has a limit of **30 RPM (Requests Per Minute)** and **12,000 TPM (Tokens Per Minute)**. If the system prompt includes `UT_SCHOOLS_AND_PROGRAMS`, `SECTOR_INTEREST_LABELS`, and few-shot examples, it could easily be 500-1000 tokens. At 1,000 tokens per prompt, you will hit the TPM limit in just 12 keystrokes per minute across your entire app. A single user typing slowly could exhaust this and receive HTTP 429 Too Many Requests.
**The Fix:** 
- Increase the debounce to 750ms - 1000ms for the parse call (while keeping 300ms for pure keyword/embedding search), OR
- Only trigger the parse call on `Enter`/blur, OR
- Introduce a caching layer (e.g. Redis/KV) to cache exact query parses, OR
- Immediately upgrade to a paid Groq tier to lift the TPM/RPM limits.

### 3. Edge Case: Chip Dismissal UX and Re-fetching
**The Issue:** The plan says "Dismissing a chip adds that field to a local 'dismissed for this query' set, which is passed back into the parse call...". If dismissing a chip triggers a re-parse, you waste tokens and latency on an LLM call when you already have the correct `semanticQuery` and `ftsTerms`.
**The Fix:** When a user dismisses a chip, the frontend should NOT call `/api/search/parse` again. It should simply remove that filter from local state and re-fetch `/api/profiles/search` using the previously cached `semanticQuery` and `ftsTerms` from the current query, just minus the dismissed filter.

### 4. Edge Case: All-or-Nothing Zod Validation
**The Issue:** "We validate post-parse and discard the LLM output entirely on any schema mismatch." If Llama 3.3 hallucinates a single key (e.g., returns `sector: ["fintech"]` instead of `sectors: ["fintech"]`, or hallucinates an invalid college enum), the entire Zod parse fails, and the user gets no inferred filters or semantic extraction at all.
**The Fix:** Use `.catch()` or `.optional()` on the Zod schema fields so that a failure in one field doesn't discard a perfectly valid `semanticQuery` or `ftsTerms` extraction. Extract what you can, drop the invalid keys, and fall back safely per-field.

### 5. Inconsistency: HTTP Method Change Implications
**The Issue:** Step 2 says "Switch to POST with a body". If `useSearchProfiles` currently relies on SWR or React Query with a `GET` request (as the current `route.ts` is `export async function GET`), switching to `POST` might break caching, deduplication, and refetch-on-focus behaviors unless the fetching library is properly configured to treat the POST body as part of the cache key.
**The Fix:** Ensure the frontend fetcher explicitly hashes the POST body as the cache key, OR keep using a GET request and pass the payload via `encodeURIComponent(JSON.stringify(payload))` into a `?payload=` parameter, which preserves native GET caching semantics.