-- Migration: Humanize the college in profiles.education
-- School onboarding used to write the raw college slug into the display-text
-- column profiles.education ("natural_sciences, Class of 2026"), so profiles
-- rendered snake_case. The write path now stores the catalog full name
-- (buildSchoolEducation in src/features/school/data/utSchoolsAndMajors.ts);
-- this backfills existing rows. Deploy that code BEFORE applying this migration
-- so no new slug rows appear afterwards.
--
-- Must run after 20261020000000_move_ut_cs_to_natural_sciences.sql, which
-- matches on the slug.
--
-- The original profiles.education is stashed in
-- school_profiles.school_data->'legacy_education' so the change can be
-- reversed by hand. The stash is written once (never overwritten on re-run).
--
-- profiles.education is a derived snapshot of college + grad year. Future
-- college moves must rewrite the human name, not the slug.
--
-- Matches with position(), not LIKE, because "_" is a LIKE wildcard.
-- Idempotent: once replaced, no row contains a slug.

CREATE TEMP TABLE _college_names (slug text PRIMARY KEY, full_name text NOT NULL) ON COMMIT DROP;

INSERT INTO _college_names (slug, full_name) VALUES
    ('mccombs_business', 'McCombs School of Business'),
    ('cockrell_engineering', 'Cockrell School of Engineering'),
    ('school_of_information', 'School of Information'),
    ('natural_sciences', 'College of Natural Sciences'),
    ('liberal_arts', 'College of Liberal Arts'),
    ('moody_communication', 'Moody College of Communication'),
    ('college_of_fine_arts', 'College of Fine Arts'),
    ('school_of_architecture', 'School of Architecture'),
    ('lbj_public_affairs', 'LBJ School of Public Affairs'),
    ('dell_medical_school', 'Dell Medical School'),
    ('jackson_geosciences', 'Jackson School of Geosciences'),
    ('school_of_civic_leadership', 'School of Civic Leadership'),
    ('college_of_education', 'College of Education'),
    ('school_of_nursing', 'School of Nursing'),
    ('college_of_pharmacy', 'College of Pharmacy'),
    ('school_of_social_work', 'School of Social Work'),
    ('school_of_law', 'School of Law'),
    ('pre_med_pre_law_teaching', 'Pre-Med, Pre-Law & Teaching');

UPDATE school_profiles sp
SET school_data = COALESCE(sp.school_data, '{}'::jsonb)
                  || jsonb_build_object('legacy_education', p.education)
FROM profiles p
WHERE p.user_id = sp.user_id
  AND NOT (COALESCE(sp.school_data, '{}'::jsonb) ? 'legacy_education')
  AND EXISTS (
    SELECT 1 FROM _college_names c WHERE position(c.slug IN p.education) > 0
  );

DO $$
DECLARE
  slug_row record;
  total integer := 0;
  affected integer;
BEGIN
  FOR slug_row IN SELECT slug, full_name FROM _college_names LOOP
    UPDATE profiles
    SET education = replace(education, slug_row.slug, slug_row.full_name)
    WHERE position(slug_row.slug IN education) > 0;
    GET DIAGNOSTICS affected = ROW_COUNT;
    total := total + affected;
  END LOOP;

  RAISE NOTICE '✅ Humanized college in profiles.education for % row(s)', total;
END $$;
