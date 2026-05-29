-- Add explicit cofounder intent to school_profiles (Join me vs Seeking to join)

ALTER TABLE school_profiles
  ADD COLUMN IF NOT EXISTS intent text
  CHECK (intent IN ('join_me', 'seeking_to_join', 'no_preference'));

CREATE INDEX IF NOT EXISTS idx_school_profiles_intent
  ON school_profiles (organization_id, intent);

-- Backfill from profiles.cofounder_status (stored from startup onboarding)
UPDATE school_profiles sp
SET intent = CASE
  WHEN p.cofounder_status IN ('Solo founder', 'Have co-founder(s)') THEN 'join_me'
  WHEN p.cofounder_status = 'Seeking co-founder' THEN 'seeking_to_join'
  ELSE 'no_preference'
END
FROM profiles p
WHERE sp.user_id = p.user_id
  AND sp.intent IS NULL;

UPDATE school_profiles
SET intent = 'no_preference'
WHERE intent IS NULL;
