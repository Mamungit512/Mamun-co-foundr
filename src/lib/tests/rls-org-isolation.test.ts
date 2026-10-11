/**
 * RLS org-isolation integration tests (Stage 1 of the RLS-activation rollout).
 *
 * These hit a REAL local Supabase and are therefore OPT-IN: they only run when
 * RUN_RLS_TESTS=1, so plain `npm run test` / CI is unaffected. Keys are read
 * automatically from the running local stack (`supabase status -o env`), so all
 * you need is the stack up:
 *
 *   supabase start                              # if not already running
 *   RUN_RLS_TESTS=1 npx vitest run rls-org-isolation
 *
 * Prerequisite: a local stack built from migrations + seed — `supabase start`
 * then `supabase db reset`, which replays 20260101000000_baseline_schema (all
 * base tables) and supabase/seed.sql (the UT org + UT mock profiles these tests
 * read as fixtures).
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
import { execSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const RUN = process.env.RUN_RLS_TESTS === "1";

/**
 * Source keys straight from the running local stack so `RUN_RLS_TESTS=1 npx
 * vitest run rls-org-isolation` works with no manual env export. Returns {} if
 * the CLI/stack isn't reachable (e.g. local stack stopped), leaving the
 * process.env fallbacks and the RLS_TEST_ALLOW_REMOTE path intact.
 */
function loadLocalSupabaseEnv(): Record<string, string> {
  try {
    const out = execSync("supabase status -o env", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const env: Record<string, string> = {};
    for (const line of out.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)="(.*)"$/);
      if (m) env[m[1]] = m[2];
    }
    return env;
  } catch {
    return {};
  }
}

// Local-stack values WIN (this is a LOCAL-only integration test); process.env is
// the fallback so the RLS_TEST_ALLOW_REMOTE path still works when the stack is down.
const local = RUN ? loadLocalSupabaseEnv() : {};
const pick = (...vals: Array<string | undefined>): string =>
  vals.find((v) => v != null && v !== "") ?? "";

const SUPABASE_URL = pick(
  local.API_URL,
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.API_URL,
  "http://127.0.0.1:54321",
);
const ANON_KEY = pick(
  local.ANON_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_KEY,
  process.env.ANON_KEY,
);
const SERVICE_ROLE_KEY = pick(
  local.SERVICE_ROLE_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  process.env.SERVICE_ROLE_KEY,
);
const JWT_SECRET = pick(
  local.JWT_SECRET,
  process.env.SUPABASE_JWT_SECRET,
  process.env.JWT_SECRET,
  "super-secret-jwt-token-with-at-least-32-characters-long",
);

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

  // UT mock user_ids that seed.sql inserts — we seed their pool memberships here
  // because seed.sql runs AFTER migrations, so the backfill in
  // 20260623000001 doesn't pick them up.
  const UT_MOCK_IDS = [
    "user_mock_ut_001",
    "user_mock_ut_002",
    "user_mock_ut_003",
    "user_mock_ut_004",
    "user_mock_ut_005",
    "user_mock_ut_006",
    "user_mock_ut_007",
    "user_mock_ut_008",
    "user_mock_ut_009",
    "user_mock_ut_010",
  ];

  beforeAll(async () => {
    expect(
      IS_LOCAL || process.env.RLS_TEST_ALLOW_REMOTE === "1",
      `refusing to seed/delete against non-local Supabase (${SUPABASE_URL}); set RLS_TEST_ALLOW_REMOTE=1 to override`,
    ).toBe(true);
    expect(
      ANON_KEY,
      "anon key missing — is the local Supabase stack running? run `supabase start`",
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

    // Seed pool membership rows for the UT mock profiles so the
    // membership-based profiles_select_org policy can see them.
    // seed.sql inserts profiles AFTER migrations run, so the backfill
    // in 20260623000001 misses these rows — we fill the gap here.
    const now = new Date().toISOString();
    const utMemberships = UT_MOCK_IDS.map((id) => ({
      user_id: id,
      organization_id: utOrgId,
      onboarded_at: now,
    }));
    await service
      .from("profile_pool_memberships")
      .delete()
      .eq("organization_id", utOrgId)
      .in("user_id", UT_MOCK_IDS);
    const { error: membershipSeedErr } = await service
      .from("profile_pool_memberships")
      .insert(utMemberships);
    expect(membershipSeedErr, "UT mock membership seed must succeed").toBeNull();

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
    // Remove the UT mock memberships we seeded (profiles themselves stay — they
    // come from seed.sql and will be reset by the next supabase db reset).
    await service
      .from("profile_pool_memberships")
      .delete()
      .eq("organization_id", utOrgId)
      .in("user_id", UT_MOCK_IDS);
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

  // ── pool-membership visibility: validates shares_pool_with() SECURITY DEFINER fix ──
  //
  // Migration 20260623000002 introduced a profiles_select_org policy that proved
  // "viewer and target share a pool" by self-joining profile_pool_memberships.
  // The ppm_owner RLS on that table clipped the target_m side, making the EXISTS
  // always false for anyone but the viewer — effectively limiting each user to
  // seeing only their own profile. Migration 20260623000004 fixes this with a
  // SECURITY DEFINER helper (shares_pool_with) that bypasses ppm_owner when
  // evaluating the join. These tests assert the corrected behavior.
  describe("pool-membership visibility (shares_pool_with)", () => {
    // Minimal test profiles — these IDs are only used here.
    const GP_ALICE = "user_rlstest_pool_alice";   // general pool
    const GP_BOB   = "user_rlstest_pool_bob";     // general pool
    const ORG_CAROL = "user_rlstest_org_carol";   // UT org pool only

    const TEST_PROFILE_IDS = [GP_ALICE, GP_BOB, ORG_CAROL];

    // Minimal profile shape that satisfies all NOT NULL constraints.
    function minimalProfile(userId: string, orgId: string | null = null) {
      return {
        user_id: userId,
        first_name: "Test",
        last_name: "User",
        title: "Test Profile",
        city: "Austin",
        country: "United States",
        satisfaction: "Happy",
        personal_intro: "RLS test fixture — safe to delete.",
        is_technical: false,
        has_startup: false,
        onboarding_complete: true,
        ...(orgId ? { organization_id: orgId } : {}),
      };
    }

    beforeAll(async () => {
      // Clean up any leftover rows from a previous aborted run.
      await service.from("profiles").delete().in("user_id", TEST_PROFILE_IDS);

      // Seed profiles (service role bypasses RLS + write-guard triggers).
      const { error: profileErr } = await service.from("profiles").insert([
        minimalProfile(GP_ALICE),
        minimalProfile(GP_BOB),
        minimalProfile(ORG_CAROL, utOrgId),
      ]);
      expect(profileErr, "pool-membership test profiles must seed").toBeNull();

      // Seed memberships — explicitly set onboarded_at so the API-layer
      // .not("onboarded_at", "is", null) filter passes in any route that
      // uses these fixtures.
      const now = new Date().toISOString();
      const { error: memberErr } = await service
        .from("profile_pool_memberships")
        .insert([
          { user_id: GP_ALICE,   organization_id: null,    onboarded_at: now },
          { user_id: GP_BOB,     organization_id: null,    onboarded_at: now },
          { user_id: ORG_CAROL,  organization_id: utOrgId, onboarded_at: now },
        ]);
      expect(memberErr, "pool-membership rows must seed").toBeNull();
    });

    afterAll(async () => {
      // Deleting profiles cascades to profile_pool_memberships (ON DELETE CASCADE).
      await service.from("profiles").delete().in("user_id", TEST_PROFILE_IDS);
    });

    it("general-pool user sees a general-pool co-member's profile", async () => {
      const alice = clientAs(mintToken({ sub: GP_ALICE }));
      const { data, error } = await alice
        .from("profiles")
        .select("user_id")
        .eq("user_id", GP_BOB);
      expect(error).toBeNull();
      expect((data ?? []).map((r) => r.user_id)).toContain(GP_BOB);
    });

    it("general-pool user cannot see a profile that is only in an org pool", async () => {
      const alice = clientAs(mintToken({ sub: GP_ALICE }));
      const { data, error } = await alice
        .from("profiles")
        .select("user_id")
        .eq("user_id", ORG_CAROL);
      expect(error).toBeNull();
      expect(data ?? []).toHaveLength(0);
    });

    it("org-pool user sees a co-member's profile in the same org pool", async () => {
      // user_mock_ut_001 has a UT org membership seeded in the outer beforeAll.
      // ORG_CAROL also has a UT org membership — they share the pool.
      const utUser = clientAs(
        mintToken({ sub: "user_mock_ut_001", organization_id: utOrgId }),
      );
      const { data, error } = await utUser
        .from("profiles")
        .select("user_id")
        .eq("user_id", ORG_CAROL);
      expect(error).toBeNull();
      expect((data ?? []).map((r) => r.user_id)).toContain(ORG_CAROL);
    });

    it("org-pool user cannot see a profile that is only in the general pool", async () => {
      // user_mock_ut_001 is in the UT org pool only (no general-pool membership).
      // GP_BOB is in the general pool only — they share no pool.
      const utUser = clientAs(
        mintToken({ sub: "user_mock_ut_001", organization_id: utOrgId }),
      );
      const { data, error } = await utUser
        .from("profiles")
        .select("user_id")
        .eq("user_id", GP_BOB);
      expect(error).toBeNull();
      expect(data ?? []).toHaveLength(0);
    });
  });
});
