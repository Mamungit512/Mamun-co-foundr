-- Migration: Seed UT Austin / Texas McCombs organization row
-- Description:
--   Inserts the UT Austin organization for the isolated sign-up flow at
--   ut.mamuncofoundr.com. Idempotent: re-running will update the existing row
--   rather than failing on the UNIQUE(slug) constraint.
--
--   Domains:
--     utexas.edu             -- primary UT EID emails
--     mccombs.utexas.edu     -- McCombs subdomain (if used separately)
--     mamuncofoundr.com      -- Mamun internal team (testing access; revisit before public launch)
--
--   Sets ferpa_dpa_signed_at = now() so the webhook's email-domain → org
--   assignment fires and middleware does not redirect to /pending-activation
--   during testing.
--
--   ⚠️  IMPORTANT: ferpa_dpa_signed_at must reflect the actual DPA signing date
--       before real student data is collected. Replace with the authoritative
--       timestamp when UT formally signs the agreement.
--
-- Run in Supabase SQL Editor or via: supabase db push

-- Defensive: ensure the subdomain column exists (referenced by middleware).
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS subdomain text;

CREATE UNIQUE INDEX IF NOT EXISTS organizations_subdomain_key
  ON organizations (subdomain)
  WHERE subdomain IS NOT NULL;

INSERT INTO organizations (
  name,
  slug,
  subdomain,
  type,
  allowed_email_domains,
  ferpa_dpa_signed_at,
  suppress_tracking,
  settings
)
VALUES (
  'The University of Texas at Austin',
  'ut',
  'ut',
  'school',
  ARRAY['utexas.edu', 'mccombs.utexas.edu', 'mamuncofoundr.com'],
  now(),
  true,
  '{}'::jsonb
)
ON CONFLICT (slug) DO UPDATE
SET
  subdomain             = EXCLUDED.subdomain,
  allowed_email_domains = EXCLUDED.allowed_email_domains,
  ferpa_dpa_signed_at   = COALESCE(organizations.ferpa_dpa_signed_at, EXCLUDED.ferpa_dpa_signed_at);

DO $$
DECLARE
  org_id     uuid;
  org_name   text;
  domains    text[];
  ferpa      timestamptz;
  subdom     text;
BEGIN
  SELECT id, name, subdomain, allowed_email_domains, ferpa_dpa_signed_at
    INTO org_id, org_name, subdom, domains, ferpa
    FROM organizations
    WHERE slug = 'ut';

  IF org_id IS NULL THEN
    RAISE EXCEPTION 'UT organization row failed to insert.';
  END IF;

  RAISE NOTICE '✅ UT org id                = %', org_id;
  RAISE NOTICE '✅ UT name                  = %', org_name;
  RAISE NOTICE '✅ UT subdomain             = %', subdom;
  RAISE NOTICE '✅ UT allowed_email_domains = %', domains;
  RAISE NOTICE '✅ UT ferpa_dpa_signed_at   = %', ferpa;
END $$;
