-- Migration: Create user_consents — durable record of legal-document acceptance
--
-- School users must accept the Privacy Policy before using the platform (enforced
-- in src/middleware.ts). This table is the single source of truth the gate reads
-- AND the durable, auditable record of consent. It is keyed by user_id alone (no
-- other NOT NULL deps) so it is writable for ANY user — including brand-new users
-- who have no `profiles` row yet (that row is created later, at onboarding).
--
-- Append-only: each acceptance inserts a new row; middleware reads the latest by
-- accepted_at. A privacy-policy version bump therefore forces re-consent.
--
-- Extends to Terms & Conditions (another `document` value) and to a fuller audit
-- record (add ip_address/user_agent columns) without rearchitecting.

CREATE TABLE IF NOT EXISTS user_consents (
  id              bigserial PRIMARY KEY,
  user_id         text NOT NULL,          -- Clerk user id
  organization_id uuid,                   -- org at accept time (snapshot of JWT claim)
  document        text NOT NULL,          -- 'privacy_policy' (future: 'terms_of_service')
  version         text NOT NULL,          -- version string the user accepted
  accepted_at     timestamptz NOT NULL DEFAULT now()
  -- future (audit upgrade): ip_address inet, user_agent text
);

-- organization_id is intentionally NOT a CASCADE FK: a legal consent record must
-- survive org (and user) deletion. It is a plain uuid snapshot so the row stays
-- self-contained and supports per-org reporting.

-- Latest-acceptance lookup used by middleware on every school page load.
CREATE INDEX IF NOT EXISTS idx_user_consents_lookup
  ON user_consents (user_id, document, accepted_at DESC);

-- Per-org reporting ("who accepted version X").
CREATE INDEX IF NOT EXISTS idx_user_consents_org
  ON user_consents (organization_id, document, version);

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
-- No client/anon policy by design: this is a legal record written by a server
-- action and read by middleware, both via SERVICE_ROLE_KEY (which bypasses RLS).
-- RLS-on + no permissive policy => client/anon-key access is denied, keeping the
-- record (and future IP/user-agent) off any client-readable surface.
--
-- DO NOT add user_consents to the account-deletion cascade in delete-profile/route.ts.
-- Consent rows are retained as proof of a past acceptance event even after the
-- account is removed (legal-obligation / legitimate-interest basis, GDPR Art. 17(3)(b)).
