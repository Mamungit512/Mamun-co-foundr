-- Migration: Expand — profile_pool_memberships
--
-- Creates the membership table so a user can be in the general pool AND
-- one-or-more school org pools simultaneously. Backfills from existing
-- profiles.organization_id and school_profiles rows. Rewrites the two
-- org-enforcement triggers to validate membership rather than reading
-- profiles.organization_id directly.
--
-- This is the "expand" step: no reads are switched yet. The RLS rework
-- and pool-listing switch are in the next migration (20260623000002).

-- ============================================================
-- profile_pool_memberships
-- ============================================================
CREATE TABLE IF NOT EXISTS profile_pool_memberships (
  user_id         text        NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  organization_id uuid        NULL     REFERENCES organizations(id)  ON DELETE CASCADE,
  onboarded_at    timestamptz NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- NULL-safe uniqueness. A plain UNIQUE on (user_id, organization_id) does not
-- deduplicate NULL general-pool rows because NULL != NULL in SQL. Two partial
-- unique indexes provide the correct semantics instead.
CREATE UNIQUE INDEX IF NOT EXISTS ppm_unique_org
  ON profile_pool_memberships (user_id, organization_id)
  WHERE organization_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ppm_unique_general
  ON profile_pool_memberships (user_id)
  WHERE organization_id IS NULL;

-- Supports pool-listing queries that scan by org
CREATE INDEX IF NOT EXISTS ppm_org_lookup
  ON profile_pool_memberships (organization_id, user_id);

ALTER TABLE profile_pool_memberships ENABLE ROW LEVEL SECURITY;

-- Owners can read/write their own rows. Onboarding writes go through the
-- service-role client (bypasses RLS) — this is defense-in-depth.
DROP POLICY IF EXISTS "ppm_owner" ON profile_pool_memberships;
CREATE POLICY "ppm_owner" ON profile_pool_memberships
  FOR ALL
  USING  (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- ============================================================
-- Atomic upsert helper (app code calls this via supabase.rpc)
-- Needed because partial unique indexes cannot be targeted by
-- PostgREST's ON CONFLICT resolution without a named constraint.
-- ============================================================
CREATE OR REPLACE FUNCTION public.upsert_pool_membership(
  p_user_id         text,
  p_organization_id uuid,
  p_onboarded_at    timestamptz DEFAULT now()
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_organization_id IS NOT NULL THEN
    INSERT INTO profile_pool_memberships (user_id, organization_id, onboarded_at)
    VALUES (p_user_id, p_organization_id, p_onboarded_at)
    ON CONFLICT (user_id, organization_id) WHERE organization_id IS NOT NULL
    DO UPDATE SET onboarded_at = EXCLUDED.onboarded_at;
  ELSE
    INSERT INTO profile_pool_memberships (user_id, organization_id, onboarded_at)
    VALUES (p_user_id, NULL, p_onboarded_at)
    ON CONFLICT (user_id) WHERE organization_id IS NULL
    DO UPDATE SET onboarded_at = EXCLUDED.onboarded_at;
  END IF;
END;
$$;

-- ============================================================
-- Idempotent backfill
-- ============================================================

-- General-pool members (profiles with NULL organization_id and not soft-deleted)
INSERT INTO profile_pool_memberships (user_id, organization_id, onboarded_at)
SELECT
  p.user_id,
  NULL::uuid,
  CASE WHEN p.onboarding_complete THEN p.updated_at ELSE NULL END
FROM profiles p
WHERE p.organization_id IS NULL
  AND p.deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Org-pool members from profiles.organization_id
INSERT INTO profile_pool_memberships (user_id, organization_id, onboarded_at)
SELECT
  p.user_id,
  p.organization_id,
  CASE WHEN p.onboarding_complete THEN p.updated_at ELSE NULL END
FROM profiles p
WHERE p.organization_id IS NOT NULL
  AND p.deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Org-pool members from school_profiles (school onboarding may set school_profiles
-- before marking onboarding_complete on the base profiles row)
INSERT INTO profile_pool_memberships (user_id, organization_id, onboarded_at)
SELECT
  sp.user_id,
  sp.organization_id,
  sp.created_at
FROM school_profiles sp
WHERE sp.organization_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================
-- Rewrite triggers to use membership instead of profiles.organization_id
--
-- The original functions read profiles.organization_id to validate that both
-- sides of a link/intent belong to the same org. After Design A, a user in
-- multiple pools no longer has a single authoritative org on their profiles
-- row, so these triggers must validate membership instead.
-- ============================================================
CREATE OR REPLACE FUNCTION public.cofounder_links_enforce_same_org()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profile_pool_memberships
      WHERE user_id = NEW.user_a_id AND organization_id IS NULL
    ) OR NOT EXISTS (
      SELECT 1 FROM profile_pool_memberships
      WHERE user_id = NEW.user_b_id AND organization_id IS NULL
    ) THEN
      RAISE EXCEPTION
        'cofounder_links: both users must be members of the general pool'
        USING ERRCODE = 'check_violation';
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM profile_pool_memberships
      WHERE user_id = NEW.user_a_id AND organization_id = NEW.organization_id
    ) OR NOT EXISTS (
      SELECT 1 FROM profile_pool_memberships
      WHERE user_id = NEW.user_b_id AND organization_id = NEW.organization_id
    ) THEN
      RAISE EXCEPTION
        'cofounder_links.organization_id (%) — both users must be members of that org',
        NEW.organization_id
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.match_intents_enforce_same_org()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profile_pool_memberships
      WHERE user_id = NEW.from_user_id AND organization_id IS NULL
    ) OR NOT EXISTS (
      SELECT 1 FROM profile_pool_memberships
      WHERE user_id = NEW.to_user_id AND organization_id IS NULL
    ) THEN
      RAISE EXCEPTION
        'match_intents: both users must be members of the general pool'
        USING ERRCODE = 'check_violation';
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM profile_pool_memberships
      WHERE user_id = NEW.from_user_id AND organization_id = NEW.organization_id
    ) OR NOT EXISTS (
      SELECT 1 FROM profile_pool_memberships
      WHERE user_id = NEW.to_user_id AND organization_id = NEW.organization_id
    ) THEN
      RAISE EXCEPTION
        'match_intents.organization_id (%) — both users must be members of that org',
        NEW.organization_id
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  RAISE NOTICE '✅ Expand: profile_pool_memberships created + backfilled; upsert_pool_membership RPC added; triggers rewritten to use membership.';
END $$;
