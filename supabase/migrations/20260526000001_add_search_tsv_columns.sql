-- Add full-text search generated column to profiles (covers bio, startup, interests, title, city)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS search_tsv tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(personal_intro, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(startup_name, '') || ' ' || coalesce(startup_description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(accomplishments, '')), 'C') ||
  setweight(to_tsvector('english', array_to_string(coalesce(priority_areas, '{}'), ' ')), 'C') ||
  setweight(to_tsvector('english', coalesce(interests, '') || ' ' || coalesce(hobbies, '')), 'D') ||
  setweight(to_tsvector('english', coalesce(city, '')), 'D')
) STORED;

CREATE INDEX IF NOT EXISTS profiles_search_tsv_gin
ON profiles USING GIN (search_tsv);

-- Add full-text search generated column to school_profiles (covers major, college, sector interests)
ALTER TABLE school_profiles
ADD COLUMN IF NOT EXISTS search_tsv tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(major, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(college, '')), 'B') ||
  setweight(to_tsvector('english', array_to_string(coalesce(sector_interests, '{}'), ' ')), 'A')
) STORED;

CREATE INDEX IF NOT EXISTS school_profiles_search_tsv_gin
ON school_profiles USING GIN (search_tsv);
