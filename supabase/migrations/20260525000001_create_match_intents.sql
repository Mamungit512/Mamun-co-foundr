-- Migration: Create match_intents table for the "We Match" feature
--
-- Each row = one user's explicit "We Match" click on another user's profile.
-- Two reciprocal rows (A→B and B→A) constitute a mutual match, which fires a
-- transactional email to both parties. `we_match_notified_at` gates the email
-- so a retry of the mutual-creating request never double-sends.
--
-- Multi-tenancy: organization_id is denormalized onto every row. A BEFORE
-- INSERT trigger enforces that both users belong to the same org as the row,
-- so a cross-org we-match is impossible at the DB layer regardless of API
-- correctness (the API also enforces this — defense in depth).
--
-- Indexes are (organization_id, …) so every per-user query stays inside its
-- school's index partition.

CREATE TABLE IF NOT EXISTS match_intents (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id          text NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  to_user_id            text NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  organization_id       uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  we_match_notified_at  timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_user_id),
  CHECK (from_user_id <> to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_match_intents_org_from
  ON match_intents (organization_id, from_user_id);

CREATE INDEX IF NOT EXISTS idx_match_intents_org_mutual_lookup
  ON match_intents (organization_id, to_user_id, from_user_id);

-- ============================================================
-- Enforce same-org membership for both users on the row
-- ============================================================
CREATE OR REPLACE FUNCTION match_intents_enforce_same_org()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  from_org uuid;
  to_org   uuid;
BEGIN
  SELECT organization_id INTO from_org FROM profiles WHERE user_id = NEW.from_user_id;
  SELECT organization_id INTO to_org   FROM profiles WHERE user_id = NEW.to_user_id;

  IF from_org IS DISTINCT FROM NEW.organization_id
     OR to_org IS DISTINCT FROM NEW.organization_id THEN
    RAISE EXCEPTION
      'match_intents.organization_id (%) must match both users'' organization_id (from=%, to=%)',
      NEW.organization_id, from_org, to_org
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_match_intents_enforce_same_org'
  ) THEN
    CREATE TRIGGER trg_match_intents_enforce_same_org
      BEFORE INSERT OR UPDATE ON match_intents
      FOR EACH ROW EXECUTE FUNCTION match_intents_enforce_same_org();
  END IF;
END $$;

-- ============================================================
-- Row Level Security — org isolation (defense in depth)
-- ============================================================
-- Server routes use the SERVICE_ROLE_KEY and bypass RLS; these policies guard
-- any client-side / anon-key access. Mirrors the convention in
-- supabase-migrations/add_organization_rls_policies.sql but uses the local
-- organization_id column instead of joining through profiles.

-- The JWT lookup is inlined into the policy (instead of calling a helper like
-- auth.organization_id()) because creating functions in the auth schema
-- requires elevated permissions that the migration role doesn't always have.

ALTER TABLE match_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_intents_org_isolation" ON match_intents;
CREATE POLICY "match_intents_org_isolation" ON match_intents
  FOR ALL
  USING (
    (
      NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
      AND organization_id IS NULL
    )
    OR
    (
      NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
      AND organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid
    )
  );

COMMENT ON TABLE match_intents IS
  '"We Match" clicks. Each row = one user signaling explicit match intent on another. Mutual rows fire a transactional email; we_match_notified_at gates re-send.';
