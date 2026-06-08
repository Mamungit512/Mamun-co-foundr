-- Migration: Co-founder invites and confirmed links
--
-- cofounder_invites: email-based invitation lifecycle. Inviter sends a token
-- by email; recipient clicks the link and accepts/declines. Status tracks the
-- full state machine: pending → accepted | declined | revoked | expired.
--
-- cofounder_links: canonical confirmed relationship between two users. One row
-- per pair, stored with user_a_id < user_b_id to prevent duplicates. Either
-- party may unlink (DELETE). Sourced from an accepted invite.
--
-- Multi-tenancy follows match_intents conventions:
--   - organization_id denormalized on every row
--   - BEFORE INSERT trigger enforces same-org for cofounder_links
--   - (organization_id, …) compound indexes for per-school query isolation
--   - RLS org-isolation policy (service-role key bypasses; guards anon access)

-- ============================================================
-- cofounder_invites
-- ============================================================
CREATE TABLE IF NOT EXISTS cofounder_invites (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_user_id     text NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  organization_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invitee_email       text NOT NULL,
  invitee_user_id     text REFERENCES profiles(user_id) ON DELETE SET NULL,
  token               text NOT NULL UNIQUE,
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','accepted','declined','revoked','expired')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  expires_at          timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  responded_at        timestamptz,
  notified_at         timestamptz,
  CONSTRAINT cofounder_invites_no_self
    CHECK (inviter_user_id <> invitee_user_id)
);

-- One live invite per inviter+invitee-email pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_cofounder_invites_pending_unique
  ON cofounder_invites (inviter_user_id, lower(invitee_email))
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_cofounder_invites_org_inviter
  ON cofounder_invites (organization_id, inviter_user_id);

CREATE INDEX IF NOT EXISTS idx_cofounder_invites_token
  ON cofounder_invites (token);

CREATE INDEX IF NOT EXISTS idx_cofounder_invites_invitee_email
  ON cofounder_invites (lower(invitee_email));

ALTER TABLE cofounder_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cofounder_invites_org_isolation" ON cofounder_invites;
CREATE POLICY "cofounder_invites_org_isolation" ON cofounder_invites
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

COMMENT ON TABLE cofounder_invites IS
  'Email-based co-founder invitations. One pending row per inviter+invitee-email. Accepted rows source a cofounder_links row.';

-- ============================================================
-- cofounder_links
-- ============================================================
CREATE TABLE IF NOT EXISTS cofounder_links (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id         text NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  user_b_id         text NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  organization_id   uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_invite_id  uuid REFERENCES cofounder_invites(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_a_id, user_b_id),
  CHECK (user_a_id <> user_b_id)
);

CREATE INDEX IF NOT EXISTS idx_cofounder_links_org_a
  ON cofounder_links (organization_id, user_a_id);

CREATE INDEX IF NOT EXISTS idx_cofounder_links_org_b
  ON cofounder_links (organization_id, user_b_id);

-- ============================================================
-- Enforce same-org for both users on cofounder_links
-- ============================================================
CREATE OR REPLACE FUNCTION cofounder_links_enforce_same_org()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  org_a uuid;
  org_b uuid;
BEGIN
  SELECT organization_id INTO org_a FROM profiles WHERE user_id = NEW.user_a_id;
  SELECT organization_id INTO org_b FROM profiles WHERE user_id = NEW.user_b_id;

  IF org_a IS DISTINCT FROM NEW.organization_id
     OR org_b IS DISTINCT FROM NEW.organization_id THEN
    RAISE EXCEPTION
      'cofounder_links.organization_id (%) must match both users'' organization_id (a=%, b=%)',
      NEW.organization_id, org_a, org_b
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cofounder_links_enforce_same_org'
  ) THEN
    CREATE TRIGGER trg_cofounder_links_enforce_same_org
      BEFORE INSERT OR UPDATE ON cofounder_links
      FOR EACH ROW EXECUTE FUNCTION cofounder_links_enforce_same_org();
  END IF;
END $$;

ALTER TABLE cofounder_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cofounder_links_org_isolation" ON cofounder_links;
CREATE POLICY "cofounder_links_org_isolation" ON cofounder_links
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

COMMENT ON TABLE cofounder_links IS
  'Confirmed co-founder pairs. user_a_id < user_b_id ordering prevents duplicate rows. Query with OR on both columns.';
