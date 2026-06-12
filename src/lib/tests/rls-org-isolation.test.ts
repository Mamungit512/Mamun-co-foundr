/**
 * RLS org-isolation integration tests (Stage 1 of the RLS-activation rollout).
 *
 * These hit a REAL local Supabase and are therefore OPT-IN: they only run when
 * RUN_RLS_TESTS=1, so plain `npm run test` / CI is unaffected. Configure the
 * keys straight from the running local stack, then run:
 *
 *   set -a; eval "$(supabase status -o env)"; set +a
 *   RUN_RLS_TESTS=1 npx vitest run -- rls-org-isolation
 *
 * Prerequisites (read before running):
 *   1. A local Supabase whose schema includes the BASE tables (profiles, likes,
 *      matching_queue, …). NOTE: `supabase db reset` alone does NOT build these —
 *      no migration CREATEs them; they exist only in the hosted project. Run
 *      `supabase db pull` first to capture the base schema as an initial
 *      migration, then `supabase db reset`. (Tracked as the Stage 1 prereq.)
 *   2. The migrations applied, including the UT seed (20260511…seed_ut_org) and
 *      the UT mock profiles (20260524…seed_ut_mock_profiles), which these tests
 *      read as fixtures.
 *
 * What this validates WITHOUT relying on Clerk:
 *   PostgREST trusts any JWT signed with the project JWT secret. We mint
 *   Clerk-SHAPED tokens (sub + role:authenticated + metadata.organization_id)
 *   with that secret, so `auth.jwt()` inside the policies sees exactly what the
 *   native Clerk integration will forward — letting us exercise the policy SQL
 *   directly. (Full Clerk→JWKS path is validated later on hosted staging.)
 *
 * Env (local defaults shown):
 *   NEXT_PUBLIC_SUPABASE_URL       http://127.0.0.1:54321
 *   NEXT_PUBLIC_SUPABASE_KEY       <local anon key>
 *   SUPABASE_SERVICE_ROLE_KEY      <local service-role key>
 *   SUPABASE_JWT_SECRET            super-secret-jwt-token-with-at-least-32-characters-long
 */
import { createHmac } from "node:crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const RUN = process.env.RUN_RLS_TESTS === "1";

// Read app-style names first, then the names `supabase status -o env` prints, so
//   set -a; eval "$(supabase status -o env)"; set +a
// is enough to configure the whole suite with the real local keys.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.API_URL ??
  "http://127.0.0.1:54321";
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ?? process.env.ANON_KEY ?? "";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY ?? "";
const JWT_SECRET =
  process.env.SUPABASE_JWT_SECRET ??
  process.env.JWT_SECRET ??
  "super-secret-jwt-token-with-at-least-32-characters-long";

// This suite SEEDS and DELETES rows — it must only ever touch a local stack.
const IS_LOCAL = /\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(SUPABASE_URL);

const b64url = (input: Buffer | string) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

/** Mint an HS256 JWT shaped like a native Clerk→Supabase token. */
function mintToken(claims: {
  sub: string;
  organization_id?: string | null;
}): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: Record<string, unknown> = {
    sub: claims.sub,
    role: "authenticated",
    iat: now,
    exp: now + 60 * 60,
    metadata: claims.organization_id
      ? { organization_id: claims.organization_id }
      : {},
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(
    JSON.stringify(payload),
  )}`;
  const signature = b64url(
    createHmac("sha256", JWT_SECRET).update(signingInput).digest(),
  );
  return `${signingInput}.${signature}`;
}

/** Anon-key client running AS a given user (RLS-enforced), like the app will. */
function clientAs(token: string): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

describe.skipIf(!RUN)("RLS org isolation", () => {
  let service: SupabaseClient;
  let utOrgId: string;

  // Owner-policy fixtures for profile_views (no FK to profiles → safe to seed).
  const ALICE = "user_rlstest_alice";
  const BOB = "user_rlstest_bob";
  const VIEW_TARGET = "user_rlstest_target";

  beforeAll(async () => {
    expect(
      IS_LOCAL || process.env.RLS_TEST_ALLOW_REMOTE === "1",
      `refusing to seed/delete against non-local Supabase (${SUPABASE_URL}); set RLS_TEST_ALLOW_REMOTE=1 to override`,
    ).toBe(true);
    expect(
      ANON_KEY,
      'anon key missing — run: set -a; eval "$(supabase status -o env)"; set +a',
    ).not.toBe("");
    expect(SERVICE_ROLE_KEY, "service-role key missing — see above").not.toBe(
      "",
    );

    service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: org, error: orgErr } = await service
      .from("organizations")
      .select("id")
      .eq("slug", "ut")
      .single();
    expect(orgErr, "UT org seed must exist (run UT seed migration)").toBeNull();
    utOrgId = org!.id;

    // Seed two profile_views rows owned by different users (service role bypasses RLS).
    await service
      .from("profile_views")
      .delete()
      .in("viewer_user_id", [ALICE, BOB]);
    const { error: seedErr } = await service.from("profile_views").insert([
      { viewer_user_id: ALICE, target_user_id: VIEW_TARGET },
      { viewer_user_id: BOB, target_user_id: VIEW_TARGET },
    ]);
    expect(seedErr).toBeNull();
  });

  afterAll(async () => {
    if (!service) return;
    await service
      .from("profile_views")
      .delete()
      .in("viewer_user_id", [ALICE, BOB]);
  });

  // ── profiles: the linchpin policy, validated read-only against the UT mock seed ──
  it("UT-claim user sees the UT mock profiles", async () => {
    const ut = clientAs(mintToken({ sub: "user_mock_ut_001", organization_id: utOrgId }));
    const { data, error } = await ut
      .from("profiles")
      .select("user_id")
      .like("user_id", "user_mock_ut_%");
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThan(0);
  });

  it("general (null-org) user sees NONE of the UT mock profiles", async () => {
    const general = clientAs(mintToken({ sub: "user_rlstest_general" }));
    const { data, error } = await general
      .from("profiles")
      .select("user_id")
      .like("user_id", "user_mock_ut_%");
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  // ── profile_views: the new owner policy ──
  it("owner sees only their own view rows", async () => {
    const alice = clientAs(mintToken({ sub: ALICE }));
    const { data, error } = await alice
      .from("profile_views")
      .select("viewer_user_id")
      .in("viewer_user_id", [ALICE, BOB]);
    expect(error).toBeNull();
    const viewers = (data ?? []).map((r) => r.viewer_user_id);
    expect(viewers).toContain(ALICE);
    expect(viewers).not.toContain(BOB);
  });

  it("owner can insert their own view but not one for another user", async () => {
    const alice = clientAs(mintToken({ sub: ALICE }));

    const ok = await alice
      .from("profile_views")
      .insert({ viewer_user_id: ALICE, target_user_id: "user_rlstest_t2" });
    expect(ok.error).toBeNull();

    const blocked = await alice
      .from("profile_views")
      .insert({ viewer_user_id: BOB, target_user_id: "user_rlstest_t3" });
    expect(blocked.error, "WITH CHECK must reject spoofed viewer").not.toBeNull();

    await service
      .from("profile_views")
      .delete()
      .eq("viewer_user_id", ALICE)
      .eq("target_user_id", "user_rlstest_t2");
  });

  // ── write-time cross-org enforcement: the match_intents same-org trigger ──
  it("rejects a cross-org match_intents insert (trigger fires under service role too)", async () => {
    const { error } = await service.from("match_intents").insert({
      from_user_id: "user_mock_ut_001",
      to_user_id: "user_mock_ut_002",
      organization_id: "00000000-0000-0000-0000-000000000000", // not the UT org
    });
    expect(error, "same-org trigger must reject mismatched organization_id").not.toBeNull();
  });
});
