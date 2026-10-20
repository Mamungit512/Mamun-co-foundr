-- Migration: Move UT Computer Science users from Cockrell Engineering to Natural Sciences
-- Computer Science at UT Austin is housed in the College of Natural Sciences, not
-- the Cockrell School of Engineering. The program catalog
-- (src/features/school/data/utSchoolsAndMajors.ts) now lists CS under
-- natural_sciences, so existing UT rows that picked CS under cockrell_engineering
-- are re-homed here. `major` is unchanged ("Computer Science" is still valid).
--
-- Also re-homes the denormalized college slug in profiles.education
-- ("<college slug>, Class of YYYY"), which is written at onboarding and not
-- resynced from school_profiles. The previous college is kept in
-- school_data.legacy_college so the move can be reversed by hand.
--
-- Idempotent: once moved, rows no longer match college = 'cockrell_engineering'.
-- Note: updating college fires school_profiles_search_tsv_trigger, which
-- re-enqueues embedding refreshes for each moved row.

WITH moved AS (
  UPDATE school_profiles sp
  SET college = 'natural_sciences',
      school_data = COALESCE(sp.school_data, '{}'::jsonb)
                    || jsonb_build_object('legacy_college', sp.college)
  FROM organizations o
  WHERE sp.organization_id = o.id
    AND o.slug = 'ut'
    AND sp.college = 'cockrell_engineering'
    AND lower(btrim(sp.major)) IN ('computer science', 'cs', 'comp sci', 'compsci')
  RETURNING sp.user_id
)
UPDATE profiles p
SET education = replace(p.education, 'cockrell_engineering', 'natural_sciences')
FROM moved
WHERE p.user_id = moved.user_id
  AND p.education LIKE '%cockrell_engineering%';

DO $$ BEGIN RAISE NOTICE '✅ UT Computer Science users moved to natural_sciences'; END $$;
