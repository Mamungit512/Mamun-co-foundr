-- Follow-up to 20260920155900: that migration revoked EXECUTE from anon and
-- authenticated explicitly, but a live ACL check afterward showed the grant
-- was actually held via PUBLIC (proacl: "{=X/postgres,postgres=X/postgres,
-- service_role=X/postgres}") — the default-privilege GRANT ALL ON FUNCTIONS
-- in the baseline schema, applied per-role, still resolves through PUBLIC for
-- functions created with no explicit owner-role grant override. Revoking a
-- named role's grant does not remove a PUBLIC grant; every role (anon and
-- authenticated included) still inherits EXECUTE through PUBLIC. Verified
-- live: the anon-key probe still succeeded after the first migration.
--
-- This migration revokes EXECUTE from PUBLIC directly, which is the actual
-- grant path, and re-confirms service_role's explicit grant (already present
-- per the ACL check) so onboarding is unaffected.

REVOKE EXECUTE ON FUNCTION public.upsert_pool_membership(text, uuid, timestamptz)
  FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.upsert_pool_membership(text, uuid, timestamptz)
  TO service_role;

DO $$
BEGIN
  RAISE NOTICE '✅ upsert_pool_membership EXECUTE revoked from PUBLIC; only service_role retains access.';
END $$;
