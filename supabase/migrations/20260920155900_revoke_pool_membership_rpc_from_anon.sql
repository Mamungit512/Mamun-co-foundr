-- Security fix (C-1): upsert_pool_membership is SECURITY DEFINER and never
-- compares p_user_id to the caller's JWT sub. Combined with the default
-- `GRANT ALL ... ON FUNCTIONS TO anon` in the baseline schema, any holder of
-- the public anon key could call it directly via PostgREST
-- (POST /rest/v1/rpc/upsert_pool_membership) with an arbitrary organization_id
-- and self-join any school's matching pool, bypassing the email-domain gate
-- entirely. Verified live against the dev project on 2026-09-20: the anon key
-- executed the function and reached the insert (blocked only by the FK on a
-- deliberately fake probe user id).
--
-- Fix: revoke EXECUTE from anon/authenticated. The function's only caller
-- (saveOnboardingProfile in src/features/profile/services/onboardingProfile.ts)
-- uses the service-role client, which holds EXECUTE independently via its own
-- grant — verified live, so this cannot affect onboarding.
--
-- Also pin search_path, which was missing on a SECURITY DEFINER function
-- (schema-injection hardening; no behavior change given the function only
-- references public.profile_pool_memberships).

REVOKE EXECUTE ON FUNCTION public.upsert_pool_membership(text, uuid, timestamptz)
  FROM anon, authenticated;

ALTER FUNCTION public.upsert_pool_membership(text, uuid, timestamptz)
  SET search_path = public;

DO $$
BEGIN
  RAISE NOTICE '✅ upsert_pool_membership EXECUTE revoked from anon/authenticated; service_role retains access.';
END $$;
