ALTER TABLE cofounder_invites ADD COLUMN IF NOT EXISTS startup_name TEXT NULL;
ALTER TABLE cofounder_invites ADD COLUMN IF NOT EXISTS startup_website TEXT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS startup_website TEXT NULL;
