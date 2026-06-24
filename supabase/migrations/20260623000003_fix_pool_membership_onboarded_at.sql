-- Migration: Fix onboarded_at for backfilled membership rows
--
-- The expand migration (20260623000001) set onboarded_at only when
-- profiles.onboarding_complete = true. That column is never written by the
-- app (Phase 1 moved onboarding-complete tracking to Clerk publicMetadata),
-- so every backfilled row landed with onboarded_at = NULL.
--
-- A profiles row exists iff the user completed onboarding (the onboarding
-- flow writes the row on submit). Treat profiles.updated_at as a conservative
-- completion timestamp for all pre-existing members.

UPDATE profile_pool_memberships m
SET onboarded_at = p.updated_at
FROM profiles p
WHERE p.user_id = m.user_id
  AND m.onboarded_at IS NULL;

DO $$
BEGIN
  RAISE NOTICE '✅ Fix: onboarded_at backfilled from profiles.updated_at for all NULL membership rows.';
END $$;
