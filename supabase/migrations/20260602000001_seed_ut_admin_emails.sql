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
