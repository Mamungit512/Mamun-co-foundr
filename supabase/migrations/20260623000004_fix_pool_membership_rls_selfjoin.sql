-- Migration: Fix pool-membership RLS self-join
--
-- Problem: the profiles_select_org policy in 20260623000002 proves "viewer and
-- target share a pool" by self-joining profile_pool_memberships. The ppm_owner
-- RLS on that table is enforced inside the subquery, so the target_m side
-- (another user's rows) is invisible — making EXISTS always false for everyone
-- except the viewer themselves. Net result: every user can only read their own
-- profile, breaking the matching feed, likes, mutual matches, conversations,
-- and user_activity_summary. Same bug exists in user_activity_summary_org_isolation.
--
-- Fix: a SECURITY DEFINER helper function that runs as its owner (bypassing
-- ppm_owner), allowing the join to see both sides. Precedent: upsert_pool_membership
-- in 20260623000001 is also SECURITY DEFINER for the same reason.
--
-- Scope: replaces only the two affected SELECT policies. No other policies,
-- tables, or write guards are changed.

-- ============================================================
-- Helper: shared-pool membership check
-- Runs as function owner → bypasses ppm_owner RLS → can see
-- both the viewer's and the target's membership rows.
-- ============================================================
CREATE OR REPLACE FUNCTION public.shares_pool_with(target text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profile_pool_memberships viewer_m
    JOIN profile_pool_memberships target_m
      ON target_m.user_id = target
     AND target_m.organization_id IS NOT DISTINCT FROM viewer_m.organization_id
    WHERE viewer_m.user_id = auth.jwt() ->> 'sub'
  );
$$;

-- ============================================================
-- profiles — fix shared-membership SELECT
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_org" ON profiles;

CREATE POLICY "profiles_select_org" ON profiles
  FOR SELECT
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR public.shares_pool_with(user_id)
  );

-- ============================================================
-- user_activity_summary — same fix (mirrors profiles policy)
-- ============================================================
DROP POLICY IF EXISTS "user_activity_summary_org_isolation" ON user_activity_summary;

CREATE POLICY "user_activity_summary_org_isolation" ON user_activity_summary
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR public.shares_pool_with(user_id)
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Fix: shares_pool_with() SECURITY DEFINER helper created; profiles_select_org and user_activity_summary_org_isolation policies rewritten to use it.';
END $$;
