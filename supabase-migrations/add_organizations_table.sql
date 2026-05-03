-- Migration: Create Organizations Table
-- Description: Introduces the organizations table for school tenant isolation.
--   Each school is one row. organization_id is NULL for general CoFoundr users.
--
-- FERPA NOTE:
--   ferpa_dpa_signed_at must be set (non-null) before any student data can be
--   collected. Middleware enforces this gate at login time.
--
-- Run this in your Supabase SQL Editor or via: supabase db push

CREATE TABLE IF NOT EXISTS organizations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  slug                  text UNIQUE NOT NULL,
  type                  text NOT NULL DEFAULT 'school',
  ferpa_dpa_signed_at   timestamptz,
  allowed_email_domains text[] NOT NULL DEFAULT '{}',
  suppress_tracking     boolean NOT NULL DEFAULT true,
  settings              jsonb NOT NULL DEFAULT '{}',
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE organizations IS
  'One row per school tenant. NULL organization_id on profiles = general CoFoundr pool.';

COMMENT ON COLUMN organizations.allowed_email_domains IS
  'Array of email domains that automatically map to this organization on signup. '
  'e.g. ARRAY[''mit.edu'', ''college.mit.edu'']. '
  'The user.created webhook checks this to assign publicMetadata.organization_id.';

COMMENT ON COLUMN organizations.ferpa_dpa_signed_at IS
  'Timestamp when the school signed the FERPA Data Processing Agreement. '
  'Must be non-null before any student can log in (enforced by middleware).';

COMMENT ON COLUMN organizations.suppress_tracking IS
  'When true, PostHog and other third-party analytics are suppressed for all '
  'users belonging to this organization (required for FERPA compliance).';

COMMENT ON COLUMN organizations.settings IS
  'Arbitrary per-school configuration (e.g. custom branding colors, feature flags).';

-- Keep updated_at in sync automatically
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_organizations_updated_at();

DO $$
BEGIN
  RAISE NOTICE '✅ organizations table created successfully.';
END $$;
