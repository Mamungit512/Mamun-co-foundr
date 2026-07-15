-- Migration: Ensure mccombs.utexas.edu is in UT Austin's allowed email domains
--
-- mccombs.utexas.edu has been documented in seed.sql as an allowed UT
-- domain, but seed.sql is not applied to production — only migrations are.
-- Ensure the live org row actually has it (idempotent — no-op if already present).

UPDATE organizations
SET allowed_email_domains = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(allowed_email_domains || ARRAY['mccombs.utexas.edu'])
  )
)
WHERE slug = 'ut'
  AND NOT ('mccombs.utexas.edu' = ANY (allowed_email_domains));

DO $$
BEGIN
  RAISE NOTICE '✅ Ensured mccombs.utexas.edu is in UT org allowed_email_domains.';
END $$;
