-- Migration: Add eid.utexas.edu to UT Austin's allowed email domains
--
-- Some UT students/staff have their primary EID mailbox at @eid.utexas.edu
-- rather than @utexas.edu. Sign-up was rejecting those addresses because
-- organizations.allowed_email_domains only listed utexas.edu and
-- mccombs.utexas.edu. Append the domain (idempotent — no-op if already present).

UPDATE organizations
SET allowed_email_domains = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(allowed_email_domains || ARRAY['eid.utexas.edu'])
  )
)
WHERE slug = 'ut'
  AND NOT ('eid.utexas.edu' = ANY (allowed_email_domains));

DO $$
BEGIN
  RAISE NOTICE '✅ Added eid.utexas.edu to UT org allowed_email_domains.';
END $$;
