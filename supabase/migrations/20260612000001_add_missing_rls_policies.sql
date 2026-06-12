-- Migration: Close RLS gaps before authenticated (non-service-role) paths land
-- Part of the RLS-activation rollout (Stage 1). Two classes of fix:
--
--   1. profile_views — RLS was ENABLED with NO policy, i.e. deny-all under any
--      non-service-role client. Add an owner policy so the converted POST route
--      (anon key + Clerk token) can record a user's own views.
--
--   2. school_profiles — the existing policy compares user_id to auth.uid()::text.
--      auth.uid() casts the JWT `sub` to uuid, but Clerk subs are `user_xxx`
--      (not UUIDs), so the cast ERRORS once Clerk third-party auth is on, turning
--      the table deny-all. Rewrite to auth.jwt() ->> 'sub' (text), matching the
--      Clerk-safe convention already used by the conversations/messages policies.
--
-- NOT changed here: user_consents. It is RLS-enabled with no policy *by design*
-- (a legal record written/read only via the service role in middleware and the
-- accept-policies server action). Leaving it deny-all for anon keeps consent
-- data — and any future IP/user-agent columns — off every client-readable
-- surface. The audit query flags it; this comment is the explanation.

-- ============================================================
-- profile_views — owner-scoped (no organization_id column; isolation is by user)
-- ============================================================
DROP POLICY IF EXISTS "profile_views_owner" ON profile_views;
CREATE POLICY "profile_views_owner" ON profile_views
  FOR ALL
  USING (viewer_user_id = auth.jwt() ->> 'sub')
  WITH CHECK (viewer_user_id = auth.jwt() ->> 'sub');

-- ============================================================
-- school_profiles — fix the uuid-cast that breaks under Clerk subs
-- ============================================================
DROP POLICY IF EXISTS "school_profiles_own_row" ON school_profiles;
CREATE POLICY "school_profiles_own_row" ON school_profiles
  FOR ALL
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

DO $$
BEGIN
  RAISE NOTICE '✅ profile_views owner policy added; school_profiles policy made Clerk-sub-safe.';
END $$;
