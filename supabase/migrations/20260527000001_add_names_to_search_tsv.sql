-- Recreate profiles search trigger to include first_name and last_name at weight A
CREATE OR REPLACE FUNCTION profiles_search_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.first_name, '') || ' ' || coalesce(NEW.last_name, '')), 'A') ||
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

-- Backfill existing rows with names included
UPDATE profiles SET search_tsv =
  setweight(to_tsvector('english'::regconfig, coalesce(first_name, '') || ' ' || coalesce(last_name, '')), 'A') ||
  setweight(to_tsvector('english'::regconfig, coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english'::regconfig, coalesce(personal_intro, '')), 'B') ||
  setweight(to_tsvector('english'::regconfig, coalesce(startup_name, '') || ' ' || coalesce(startup_description, '')), 'B') ||
  setweight(to_tsvector('english'::regconfig, coalesce(accomplishments, '')), 'C') ||
  setweight(to_tsvector('english'::regconfig, array_to_string(coalesce(priority_areas, '{}'), ' ')), 'C') ||
  setweight(to_tsvector('english'::regconfig, coalesce(interests, '') || ' ' || coalesce(hobbies, '')), 'D') ||
  setweight(to_tsvector('english'::regconfig, coalesce(city, '')), 'D');
