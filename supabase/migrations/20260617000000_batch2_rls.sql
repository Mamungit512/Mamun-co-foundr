-- Migration: Batch 2 RLS policy rollout
--
-- Covers the four tables left unscoped after the Batch 1 migration
-- (20260612000001_activate_org_isolation_rls.sql):
--
--   • access codes        — RLS was enabled but no policy existed (deny-all).
--                           Unlock SELECT for authenticated users; writes stay
--                           service-role only (service_role bypasses RLS).
--   • referrals           — RLS was enabled but no policy existed.
--                           Owner-scoped: a user sees only rows they appear in
--                           as referrer or referred party.
--   • user_activity_summary — Had a legacy USING (true) SELECT policy that let
--                           any authenticated user read all users' activity,
--                           leaking school-user data to general-pool users.
--                           Replaced with org-scoped SELECT (JOIN profiles).
--                           The existing service_role full-access policy is kept.
--   • user_consents       — RLS was enabled but no policy existed (deny-all).
--                           Owner-scoped by user_id.

-- ============================================================
-- access codes  (no user/org column — allow authenticated read)
-- ============================================================
DROP POLICY IF EXISTS "access_codes_read" ON "public"."access codes";
CREATE POLICY "access_codes_read" ON "public"."access codes"
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- referrals  (owner-scoped, no org column)
-- ============================================================
DROP POLICY IF EXISTS "referrals_own" ON referrals;
CREATE POLICY "referrals_own" ON referrals
  FOR ALL
  USING (
    referred_user_id  = auth.jwt() ->> 'sub'
    OR referrer_user_id = auth.jwt() ->> 'sub'
  )
  WITH CHECK (
    referrer_user_id = auth.jwt() ->> 'sub'
  );

-- ============================================================
-- user_activity_summary  (replace permissive USING (true) with org-scoped)
-- ============================================================
DROP POLICY IF EXISTS "Users can view others activity for matching" ON user_activity_summary;
DROP POLICY IF EXISTS "Users can view their own activity"          ON user_activity_summary;

-- Service role full-access policy ("Service role has full access") is already
-- present in the baseline and covers INSERT/UPDATE/DELETE — leave it in place.
DROP POLICY IF EXISTS "user_activity_summary_org_isolation" ON user_activity_summary;
CREATE POLICY "user_activity_summary_org_isolation" ON user_activity_summary
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = user_activity_summary.user_id
        AND (
          (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
            AND p.organization_id IS NULL)
          OR (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
            AND p.organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid)
        )
    )
  );

-- ============================================================
-- user_consents  (owner-scoped by user_id)
-- ============================================================
DROP POLICY IF EXISTS "user_consents_own" ON user_consents;
CREATE POLICY "user_consents_own" ON user_consents
  FOR ALL
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

DO $$
BEGIN
  RAISE NOTICE '✅ Batch 2 RLS activated: access codes (read), referrals (owner), user_activity_summary (org-scoped), user_consents (owner).';
END $$;
