-- Backfill organization_id on profiles rows that completed school onboarding
-- but never had organization_id written (bug: ut-profile upsert omitted the field).
-- Safe to run multiple times; only touches rows where organization_id IS NULL.
UPDATE profiles p
SET    organization_id = sp.organization_id
FROM   school_profiles sp
WHERE  sp.user_id = p.user_id
  AND  p.organization_id IS NULL;
