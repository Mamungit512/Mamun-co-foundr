-- Migration: Create organizations table (if not exists) and seed UT Austin row
-- Synced from dev instance 2026-05-11.
--
-- Safe to run against prod where organizations table does not yet exist.
-- Idempotent: re-running will not duplicate or overwrite existing data.

-- ─── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organizations (
  id                    uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text          NOT NULL,
  slug                  text          NOT NULL,
  type                  text          NOT NULL DEFAULT 'school',
  ferpa_dpa_signed_at   timestamptz,
  settings              jsonb         DEFAULT '{}'::jsonb,
  created_at            timestamptz   DEFAULT now(),
  allowed_email_domains text[]        NOT NULL DEFAULT '{}'::text[],
  suppress_tracking     boolean       NOT NULL DEFAULT true,
  updated_at            timestamptz   NOT NULL DEFAULT now(),
  subdomain             text
);

CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_key
  ON organizations (slug);

-- Ensure subdomain column exists before indexing it
-- (table may already exist in prod without this column)
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS subdomain text;

CREATE UNIQUE INDEX IF NOT EXISTS organizations_subdomain_key
  ON organizations (subdomain)
  WHERE subdomain IS NOT NULL;

-- Keep updated_at in sync
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_organizations_updated_at'
  ) THEN
    CREATE TRIGGER trg_organizations_updated_at
      BEFORE UPDATE ON organizations
      FOR EACH ROW EXECUTE FUNCTION update_organizations_updated_at();
  END IF;
END $$;

-- ─── Seed: UT Austin ─────────────────────────────────────────────────────────
--
-- allowed_email_domains:
--   utexas.edu           — primary UT EID emails
--   mccombs.utexas.edu   — McCombs subdomain
--   mamuncofoundr.com    — Mamun internal team (revisit before public launch)
--
-- ⚠️  ferpa_dpa_signed_at is set to a placeholder timestamp for testing.
--     Replace with the authoritative DPA signing date before collecting
--     real student data.

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
  'University of Texas at Austin',
  'ut',
  'ut',
  'school',
  ARRAY['utexas.edu', 'mccombs.utexas.edu', 'mamuncofoundr.com'],
  '2026-05-01T23:21:50.033129+00:00',
  true,
  '{}'::jsonb
)
ON CONFLICT (slug) DO UPDATE
SET
  subdomain             = EXCLUDED.subdomain,
  allowed_email_domains = EXCLUDED.allowed_email_domains,
  ferpa_dpa_signed_at   = COALESCE(organizations.ferpa_dpa_signed_at, EXCLUDED.ferpa_dpa_signed_at);
