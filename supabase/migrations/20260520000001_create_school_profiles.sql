-- Migration: Create School Profiles Extension Table
--
-- Unified extension table for any school-tenant's onboarding data. Shared fields
-- (name, title, experience, etc.) remain in the main `profiles` table; the
-- school-specific structured fields (status, college, degree, major, sectors)
-- live here. The shape is identical across schools — only the values differ.
-- Per-school valid values for `college` and `sector_interests` are enforced at
-- the application layer (see src/lib/utSchoolsAndMajors.ts for UT).
--
-- `organization_id` is duplicated from profiles for query performance, RLS
-- scoping, and to support a user belonging to multiple schools in the future.

CREATE TABLE IF NOT EXISTS school_profiles (
  id                   bigserial PRIMARY KEY,
  user_id              text NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  organization_id      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  school_status        text NOT NULL CHECK (school_status IN ('student', 'alumni')),
  graduation_year      integer CHECK (graduation_year BETWEEN 1900 AND 2100),
  college              text,
  degree_type          text CHECK (degree_type IN ('bachelors', 'masters', 'professional', 'other')),
  major                text,
  sector_interests     text[],
  additional_education text,
  school_data          jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_school_profiles_org
  ON school_profiles (organization_id);

CREATE INDEX IF NOT EXISTS idx_school_profiles_sectors
  ON school_profiles USING gin (sector_interests);

ALTER TABLE school_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and write only their own row
CREATE POLICY "school_profiles_own_row" ON school_profiles
  FOR ALL
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Keep updated_at in sync (mirrors the pattern from organizations table)
CREATE OR REPLACE FUNCTION update_school_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_school_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_school_profiles_updated_at
      BEFORE UPDATE ON school_profiles
      FOR EACH ROW EXECUTE FUNCTION update_school_profiles_updated_at();
  END IF;
END $$;

COMMENT ON TABLE school_profiles IS
  'Extension table for school-tenant onboarding (UT Austin and future schools). One row per school-onboarded user, linked to profiles.user_id. Presence acts as the "verified school user" gate for matching.';
