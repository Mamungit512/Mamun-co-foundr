-- Migration: Generalize school_profiles.degree_type to degree levels
-- Degree level is now independent of college. Keep in sync with
-- DEGREE_TYPE_LABELS in src/features/school/data/utSchoolsAndMajors.ts.
--   professional -> doctorate  (MD, JD, PharmD, DNP are professional doctorates)
--   other        -> NULL       (Pre-Med/Pre-Law/Pre-Teaching; carries no level)
-- The retired value is kept in school_data.legacy_degree_type.
-- Order matters: the old CHECK rejects 'doctorate', so drop -> rewrite -> re-add.

ALTER TABLE school_profiles
  DROP CONSTRAINT IF EXISTS school_profiles_degree_type_check;

UPDATE school_profiles
SET school_data = school_data || jsonb_build_object('legacy_degree_type', degree_type),
    degree_type = CASE degree_type WHEN 'professional' THEN 'doctorate' ELSE NULL END
WHERE degree_type IN ('professional', 'other');

ALTER TABLE school_profiles
  ADD CONSTRAINT school_profiles_degree_type_check
  CHECK (degree_type = ANY (ARRAY['bachelors', 'masters', 'doctorate', 'certificate']));

DO $$ BEGIN RAISE NOTICE '✅ school_profiles.degree_type generalized (professional -> doctorate, other -> NULL)'; END $$;
