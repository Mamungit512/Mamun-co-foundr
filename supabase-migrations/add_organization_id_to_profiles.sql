-- Migration: Add organization_id to profiles
-- Description: Links each profile to an organization (school). NULL = general CoFoundr pool.
--
-- Run AFTER add_organizations_table.sql

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_organization_id
  ON profiles(organization_id);

COMMENT ON COLUMN profiles.organization_id IS
  'FK to organizations. NULL for general CoFoundr users. '
  'Non-null for school users — enforces tenant isolation via RLS and service-layer filters.';

DO $$
BEGIN
  RAISE NOTICE '✅ organization_id column added to profiles table.';
END $$;
