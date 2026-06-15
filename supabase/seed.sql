-- Local/dev seed data (auto-run by `supabase db reset`). NOT pushed to prod.
-- Reconstructed from the pre-squash seed migrations so a fresh local DB has the
-- UT org + mock profiles + admin emails that the app and RLS tests expect.

-- Disable triggers for the duration of seeding. Inserting profiles otherwise
-- fires the embedding-refresh trigger, which enqueues into a pgmq queue that
-- only exists in the hosted project (not the local schema dump). We don't need
-- embeddings for local dev / RLS fixtures, so bypass triggers while seeding.
SET session_replication_role = 'replica';

-- ── UT organization ─────────────────────────────────────────────────────────
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

-- ── UT mock profiles ────────────────────────────────────────────────────────
-- Seed: 10 mock UT Austin profiles for development/testing
--
-- Covers all 10 UT colleges, a mix of students/alumni, founders/non-founders,
-- technical and non-technical backgrounds.
--
-- UT affiliation is expressed via organization_id (FK to organizations.id).
-- Prerequisites: 20260511000000_seed_ut_org.sql must have been run first.
--
-- Note: user_ids use a 'user_mock_ut_' prefix so they are easy to identify
-- and clean up. These are not real Clerk auth users — remove before production.

DO $$
DECLARE
  ut_org_id uuid;
BEGIN
  SELECT id INTO ut_org_id FROM organizations WHERE slug = 'ut';

  IF ut_org_id IS NULL THEN
    RAISE EXCEPTION 'UT organization not found — run 20260511000000_seed_ut_org.sql first.';
  END IF;

  INSERT INTO profiles (
    user_id, first_name, last_name, title,
    city, state, country,
    satisfaction, battery_level,
    experience, personal_intro,
    archetype, is_technical,
    has_startup, startup_name, startup_description,
    startup_time_spent, startup_funding,
    cofounder_status, equity_expectation,
    linkedin, git,
    priority_areas,
    onboarding_complete, organization_id
  )
  VALUES

  -- 1. Emma Rodriguez — McCombs BBA, Fintech founder
  (
    'user_mock_ut_001', 'Emma', 'Rodriguez',
    'Finance & Product Intern at JPMorgan',
    'Austin', 'Texas', 'United States',
    'Happy', 'Energized',
    '3 years of internship experience in financial services and fintech startups. Led product discovery for a mobile payments feature serving 50k users.',
    'I''m a finance and product nerd who believes fintech can democratize access to financial services. Exploring how AI can make personal finance less intimidating for Gen Z.',
    'the_scaler', false,
    true, 'SplitRight',
    'AI-powered expense splitting for roommates and friend groups, with automatic settlement via Venmo/Zelle.',
    '6-12 months', 'Pre-seed',
    'Solo founder', 20,
    'linkedin.com/in/emmarodriguez-ut', '',
    ARRAY['Fintech', 'AI / ML', 'Consumer Tech'],
    true, ut_org_id
  ),

  -- 2. James Chen — Cockrell CS, AI/ML founder
  (
    'user_mock_ut_002', 'James', 'Chen',
    'ML Engineer Intern at Apple | CS @ UT Austin',
    'Austin', 'Texas', 'United States',
    'Happy', 'Energized',
    '2 years of software engineering across ML infrastructure, NLP, and applied AI research. Built and deployed production ML pipelines processing 1M+ records/day.',
    'I build AI systems that actually work in production — not just demos. Passionate about applied machine learning, distributed systems, and the intersection of AI and developer tooling.',
    'the_architect', true,
    true, 'ContextIQ',
    'Developer tooling that uses LLMs to auto-generate context-aware documentation and onboarding guides from existing codebases.',
    '3-6 months', 'Bootstrapped',
    'Seeking co-founder', 15,
    'linkedin.com/in/jamesc-ut', 'github.com/jameschen-dev',
    ARRAY['AI / ML', 'Developer Tools', 'B2B SaaS'],
    true, ut_org_id
  ),

  -- 3. Sarah Kim — iSchool Data Science MS, no startup
  (
    'user_mock_ut_003', 'Sarah', 'Kim',
    'Data Science MS @ UT Austin | UX Researcher',
    'Austin', 'Texas', 'United States',
    'Content', 'Content',
    '4 years of UX research and data analysis. Conducted 100+ user interviews and translated findings into product strategy at two Series A startups.',
    'I sit at the intersection of quantitative data and human behavior. Most excited about products that use data responsibly to improve how people learn and work.',
    'the_steward', false,
    false, null, null, null, null,
    null, null,
    'linkedin.com/in/sarahkim-ischool', '',
    ARRAY['Data & Analytics', 'EdTech', 'No-code / Low-code'],
    true, ut_org_id
  ),

  -- 4. Marcus Williams — Natural Sciences Neuroscience, digital health founder
  (
    'user_mock_ut_004', 'Marcus', 'Williams',
    'Neuroscience Researcher & Digital Health Builder',
    'Austin', 'Texas', 'United States',
    'Happy', 'Energized',
    '2 years of wet lab research in computational neuroscience and 1 year building consumer digital health products. Experience with EEG signal processing and behavioral experiment design.',
    'Neuroscience trained me to think about systems and feedback loops. Applying that lens to mental health tech — tools that help people understand and regulate their own nervous system.',
    'the_architect', true,
    true, 'Regulate',
    'A biofeedback app that guides users through real-time stress regulation exercises using wearable sensor data (Oura, Apple Watch).',
    '1-3 months', 'Pre-seed',
    'Seeking co-founder', 20,
    'linkedin.com/in/marcuswilliams-neuro', '',
    ARRAY['HealthTech', 'Mental Health', 'BioTech'],
    true, ut_org_id
  ),

  -- 5. Priya Patel — Liberal Arts Economics, no startup
  (
    'user_mock_ut_005', 'Priya', 'Patel',
    'Policy Researcher & Social Entrepreneur',
    'Austin', 'Texas', 'United States',
    'Content', 'Content',
    '3 years of policy research and community organizing. Worked at the Texas Policy Lab and interned with a US Senator''s office on economic policy.',
    'I study how economic systems create or close opportunity gaps. Goal: build ventures at the intersection of policy and technology that expand access in education and workforce development.',
    'the_steward', false,
    false, null, null, null, null,
    null, null,
    'linkedin.com/in/priyapatel-policy', '',
    ARRAY['GovTech', 'EdTech', 'Impact Investing'],
    true, ut_org_id
  ),

  -- 6. Tyler Brooks — Moody Advertising, creator economy founder
  (
    'user_mock_ut_006', 'Tyler', 'Brooks',
    'Creative Strategist & Media Founder',
    'Austin', 'Texas', 'United States',
    'Happy', 'Energized',
    '3 years of brand strategy and content creation. Grew a personal media brand to 80k followers across TikTok and Instagram. Led campaigns for 5 DTC brands.',
    'The next generation of media brands will be built by creators who also understand business. Building at the intersection of creator economy, brand storytelling, and community.',
    'the_scaler', false,
    true, 'StoryStack',
    'A platform that helps DTC brands co-create authentic content with micro-influencers at scale, using AI to match brand voice with creator style.',
    '6-12 months', 'Bootstrapped',
    'Have co-founder(s)', 15,
    'linkedin.com/in/tylerbrooks-moody', '',
    ARRAY['B2B SaaS', 'Social & Creator Economy', 'AI / ML'],
    true, ut_org_id
  ),

  -- 7. Ananya Singh — Dell Medical School MD, no startup
  (
    'user_mock_ut_007', 'Ananya', 'Singh',
    'MD Student @ Dell Med | Health Innovation',
    'Austin', 'Texas', 'United States',
    'Content', 'Energized',
    '5 years of clinical research and health policy experience. Published 3 papers on AI diagnostics and ran a clinical trial at Johns Hopkins. Participating in Dell Med''s Health Innovation track.',
    'I chose Dell Med for its focus on redesigning health care. Interested in building AI diagnostic tools that can bring specialist-level insights to underserved communities.',
    'the_architect', false,
    false, null, null, null, null,
    null, null,
    'linkedin.com/in/ananyasingh-md', '',
    ARRAY['HealthTech', 'AI / ML', 'Genomics'],
    true, ut_org_id
  ),

  -- 8. Connor Murphy — LBJ MPAff alumni, govtech founder
  (
    'user_mock_ut_008', 'Connor', 'Murphy',
    'GovTech Founder | LBJ MPAff Alum',
    'Austin', 'Texas', 'United States',
    'Happy', 'Energized',
    '4 years of public sector technology and civic innovation. Worked at the City of Austin Office of Innovation and a YC-backed govtech company. Managed $2M in federal grant programs.',
    'I spent two years inside city government learning where technology could reduce friction for citizens. Now building tools to modernize how local governments deliver services.',
    'the_scaler', false,
    true, 'CivicFlow',
    'A no-code platform that lets city governments digitize and automate citizen-facing workflows — permits, licenses, benefits — without custom development.',
    '2+ years', 'Seed',
    'Have co-founder(s)', 10,
    'linkedin.com/in/connormurphy-lbj', '',
    ARRAY['GovTech', 'No-code / Low-code', 'B2B SaaS'],
    true, ut_org_id
  ),

  -- 9. Luna Torres — Architecture MArch alumni, cleantech founder
  (
    'user_mock_ut_009', 'Luna', 'Torres',
    'Sustainable Design & CleanTech Founder',
    'Austin', 'Texas', 'United States',
    'Happy', 'Energized',
    '5 years of architectural design and sustainable building. Led net-zero design projects at a top Austin firm. Expertise in embodied carbon analysis and biophilic design.',
    'Architecture taught me to design systems holistically. Applying that to the built environment''s massive climate impact — starting with the construction materials supply chain.',
    'the_architect', false,
    true, 'TerraMod',
    'A marketplace for low-carbon building materials, connecting sustainable manufacturers with architects and general contractors.',
    '1-2 years', 'Pre-seed',
    'Seeking co-founder', 25,
    'linkedin.com/in/lunatorres-arch', '',
    ARRAY['CleanTech', 'Climate Tech', 'Energy Tech'],
    true, ut_org_id
  ),

  -- 10. David Park — McCombs MBA alumni, B2B SaaS / fintech founder
  (
    'user_mock_ut_010', 'David', 'Park',
    'Venture Builder | McCombs MBA Alum | ex-Goldman',
    'Austin', 'Texas', 'United States',
    'Happy', 'Energized',
    '9 years in finance and venture building. 5 years at Goldman Sachs in TMT investment banking, then MBA, then Head of Finance at a Series B fintech. Now building.',
    'After years of financing other people''s startups, I decided to build my own. Focused on B2B SaaS and fintech where I have deep pattern recognition from the banking and operator side.',
    'the_scaler', false,
    true, 'Clearbook',
    'Financial operations platform for venture-backed startups — automated bookkeeping, investor reporting, and runway forecasting powered by AI.',
    '2+ years', 'Seed',
    'Have co-founder(s)', 10,
    'linkedin.com/in/davidpark-mba', '',
    ARRAY['Fintech', 'B2B SaaS', 'AI / ML'],
    true, ut_org_id
  )

  ON CONFLICT (user_id) DO NOTHING;

  -- Companion school_profiles rows. Presence here is the "verified school user"
  -- gate used by /api/profiles. Without these, the mock profiles above would be
  -- invisible in the UT matching pool.
  INSERT INTO school_profiles (
    user_id, organization_id,
    school_status, graduation_year,
    college, degree_type, major,
    sector_interests, additional_education
  )
  VALUES
    ('user_mock_ut_001', ut_org_id, 'student',  2026, 'mccombs_business',     'bachelors',    'Business Administration',     ARRAY['fintech','b2b_saas','ai_ml'],          NULL),
    ('user_mock_ut_002', ut_org_id, 'student',  2026, 'cockrell_engineering', 'bachelors',    'Computer Science',            ARRAY['ai_ml','deeptech','b2b_saas'],         NULL),
    ('user_mock_ut_003', ut_org_id, 'student',  2027, 'school_of_information','masters',      'Data Science',                ARRAY['data','ux','edtech'],                  NULL),
    ('user_mock_ut_004', ut_org_id, 'student',  2026, 'natural_sciences',     'bachelors',    'Neuroscience',                ARRAY['healthtech','biotech'],                NULL),
    ('user_mock_ut_005', ut_org_id, 'student',  2026, 'liberal_arts',         'bachelors',    'Economics',                   ARRAY['policy','impact','govtech'],           NULL),
    ('user_mock_ut_006', ut_org_id, 'student',  2026, 'moody_communication',  'bachelors',    'Advertising',                 ARRAY['media','consumer','b2b_saas'],         NULL),
    ('user_mock_ut_007', ut_org_id, 'student',  2028, 'dell_medical_school',  'professional', 'Doctor of Medicine',          ARRAY['healthtech','biotech','ai_ml'],        NULL),
    ('user_mock_ut_008', ut_org_id, 'alumni',   2023, 'lbj_public_affairs',   'masters',      'Public Affairs',              ARRAY['govtech','impact','policy'],           NULL),
    ('user_mock_ut_009', ut_org_id, 'alumni',   2022, 'school_of_architecture','masters',     'Architecture',                ARRAY['cleantech','proptech'],                NULL),
    ('user_mock_ut_010', ut_org_id, 'alumni',   2020, 'mccombs_business',     'masters',      'Business Administration',     ARRAY['fintech','b2b_saas','ai_ml'],          'BA Economics, Princeton (2014)')
  ON CONFLICT (user_id) DO NOTHING;

END $$;

-- ── UT admin emails ─────────────────────────────────────────────────────────
-- Seed admin email addresses for the UT Austin organization.
-- These users will have access to /school/ut/admin (and ut.mamuncofoundr.com/admin).
-- Emails must match verified Clerk primary email addresses.
-- Add or remove emails by editing the JSON array and re-running this migration.

UPDATE organizations
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{admin_emails}',
  '["admin@mamuncofoundr.com"]'::jsonb
)
WHERE slug = 'ut';
