-- Add search_tsv to profiles via trigger (generated columns can't use array_to_string on Supabase)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_tsv tsvector;

CREATE OR REPLACE FUNCTION profiles_search_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.personal_intro, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.startup_name, '') || ' ' || coalesce(NEW.startup_description, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.accomplishments, '')), 'C') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(coalesce(NEW.priority_areas, '{}'), ' ')), 'C') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.interests, '') || ' ' || coalesce(NEW.hobbies, '')), 'D') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.city, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_search_tsv_trigger ON profiles;
CREATE TRIGGER profiles_search_tsv_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION profiles_search_tsv_update();

-- Backfill existing rows
UPDATE profiles SET search_tsv =
  setweight(to_tsvector('english'::regconfig, coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english'::regconfig, coalesce(personal_intro, '')), 'B') ||
  setweight(to_tsvector('english'::regconfig, coalesce(startup_name, '') || ' ' || coalesce(startup_description, '')), 'B') ||
  setweight(to_tsvector('english'::regconfig, coalesce(accomplishments, '')), 'C') ||
  setweight(to_tsvector('english'::regconfig, array_to_string(coalesce(priority_areas, '{}'), ' ')), 'C') ||
  setweight(to_tsvector('english'::regconfig, coalesce(interests, '') || ' ' || coalesce(hobbies, '')), 'D') ||
  setweight(to_tsvector('english'::regconfig, coalesce(city, '')), 'D');

CREATE INDEX IF NOT EXISTS profiles_search_tsv_gin ON profiles USING GIN (search_tsv);

-- Add search_tsv to school_profiles via trigger
ALTER TABLE school_profiles ADD COLUMN IF NOT EXISTS search_tsv tsvector;

CREATE OR REPLACE FUNCTION school_profiles_search_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.major, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.college, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(coalesce(NEW.sector_interests, '{}'), ' ')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS school_profiles_search_tsv_trigger ON school_profiles;
CREATE TRIGGER school_profiles_search_tsv_trigger
  BEFORE INSERT OR UPDATE ON school_profiles
  FOR EACH ROW EXECUTE FUNCTION school_profiles_search_tsv_update();

-- Backfill existing rows
UPDATE school_profiles SET search_tsv =
  setweight(to_tsvector('english'::regconfig, coalesce(major, '')), 'A') ||
  setweight(to_tsvector('english'::regconfig, coalesce(college, '')), 'B') ||
  setweight(to_tsvector('english'::regconfig, array_to_string(coalesce(sector_interests, '{}'), ' ')), 'A');

CREATE INDEX IF NOT EXISTS school_profiles_search_tsv_gin ON school_profiles USING GIN (search_tsv);
