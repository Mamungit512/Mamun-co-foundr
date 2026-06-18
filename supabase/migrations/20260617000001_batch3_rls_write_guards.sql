-- Migration: Batch 3 RLS write guards
--
-- Batch 1 replaced the original owner-scoped write policies on profiles
-- (Allow update/delete/insert for owner) with a single FOR ALL org-isolation
-- policy. This silently removed the owner check on writes — any user in the
-- same org could UPDATE or DELETE another user's profile.
--
-- This migration fixes that regression and applies the same owner-check
-- pattern to the other tables whose FOR ALL policies only scope by org:
--
--   • profiles        — regression fix: split FOR ALL into SELECT (org-scoped)
--                       + INSERT/UPDATE/DELETE (owner-scoped)
--   • match_intents   — split FOR ALL into SELECT (org-scoped)
--                       + writes restricted to from_user_id
--   • cofounder_invites — split FOR ALL into SELECT (org-scoped)
--                       + writes restricted to inviter_user_id
--   • messages        — existing USING (participant check) had no WITH CHECK;
--                       split into SELECT (participant) + INSERT that also
--                       asserts sender_id = current user. UPDATE/DELETE are
--                       intentionally left without a policy (deny-all for
--                       authenticated users — writes go through service role).
--   • cofounder_links — writes go through service role (bypasses RLS), but
--                       add a WITH CHECK as defense-in-depth.

-- ============================================================
-- profiles  (regression fix from batch 1)
-- ============================================================
DROP POLICY IF EXISTS "profiles_org_isolation"  ON profiles;
DROP POLICY IF EXISTS "profiles_select_org"     ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"     ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"     ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own"     ON profiles;

-- SELECT: users see profiles in their own org (needed for matching)
CREATE POLICY "profiles_select_org" ON profiles
  FOR SELECT
  USING (
    (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
      AND organization_id IS NULL)
    OR
    (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
      AND organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid)
  );

-- INSERT: can only create your own profile row
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- UPDATE: can only update your own profile row
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- DELETE: can only delete your own profile row
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE
  USING (user_id = auth.jwt() ->> 'sub');

-- ============================================================
-- match_intents  (org-scoped SELECT + from_user write guard)
-- ============================================================
DROP POLICY IF EXISTS "match_intents_org_isolation" ON match_intents;
DROP POLICY IF EXISTS "match_intents_select_org"    ON match_intents;
DROP POLICY IF EXISTS "match_intents_write_own"     ON match_intents;

CREATE POLICY "match_intents_select_org" ON match_intents
  FOR SELECT
  USING (
    (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
      AND organization_id IS NULL)
    OR
    (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
      AND organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid)
  );

CREATE POLICY "match_intents_insert_own" ON match_intents
  FOR INSERT
  WITH CHECK (from_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "match_intents_update_own" ON match_intents
  FOR UPDATE
  USING (from_user_id = auth.jwt() ->> 'sub')
  WITH CHECK (from_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "match_intents_delete_own" ON match_intents
  FOR DELETE
  USING (from_user_id = auth.jwt() ->> 'sub');

-- ============================================================
-- cofounder_invites  (org-scoped SELECT + inviter write guard)
-- ============================================================
DROP POLICY IF EXISTS "cofounder_invites_org_isolation" ON cofounder_invites;
DROP POLICY IF EXISTS "cofounder_invites_select_org"    ON cofounder_invites;
DROP POLICY IF EXISTS "cofounder_invites_insert_own"    ON cofounder_invites;
DROP POLICY IF EXISTS "cofounder_invites_update_own"    ON cofounder_invites;
DROP POLICY IF EXISTS "cofounder_invites_delete_own"    ON cofounder_invites;

CREATE POLICY "cofounder_invites_select_org" ON cofounder_invites
  FOR SELECT
  USING (
    (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
      AND organization_id IS NULL)
    OR
    (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
      AND organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid)
  );

CREATE POLICY "cofounder_invites_insert_own" ON cofounder_invites
  FOR INSERT
  WITH CHECK (inviter_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "cofounder_invites_update_own" ON cofounder_invites
  FOR UPDATE
  USING (inviter_user_id = auth.jwt() ->> 'sub')
  WITH CHECK (inviter_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "cofounder_invites_delete_own" ON cofounder_invites
  FOR DELETE
  USING (inviter_user_id = auth.jwt() ->> 'sub');

-- ============================================================
-- messages  (participant SELECT + sender INSERT guard)
--
-- UPDATE/DELETE are intentionally left without a user-facing policy
-- (deny-all for authenticated). All message writes go through the
-- service role in /api/messages/.../send/route.ts which bypasses RLS.
-- ============================================================
DROP POLICY IF EXISTS "messages_org_isolation"      ON messages;
DROP POLICY IF EXISTS "messages_select_participant" ON messages;
DROP POLICY IF EXISTS "messages_insert_own"         ON messages;

CREATE POLICY "messages_select_participant" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM conversation_participants cp
      JOIN profiles p ON p.user_id = cp.user_id
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.jwt() ->> 'sub'
        AND (
          (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
            AND p.organization_id IS NULL)
          OR (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
            AND p.organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid)
        )
    )
  );

CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.jwt() ->> 'sub'
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================================
-- cofounder_links  (defense-in-depth; writes are service-role)
-- ============================================================
DROP POLICY IF EXISTS "cofounder_links_org_isolation" ON cofounder_links;
DROP POLICY IF EXISTS "cofounder_links_select_org"    ON cofounder_links;
DROP POLICY IF EXISTS "cofounder_links_write_own"     ON cofounder_links;

CREATE POLICY "cofounder_links_select_org" ON cofounder_links
  FOR SELECT
  USING (
    (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
      AND organization_id IS NULL)
    OR
    (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
      AND organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid)
  );

-- Writes restricted to a participant in the link (defense-in-depth;
-- production inserts go through service role in /api/cofounder-invite/.../accept).
CREATE POLICY "cofounder_links_insert_own" ON cofounder_links
  FOR INSERT
  WITH CHECK (
    user_a_id = auth.jwt() ->> 'sub'
    OR user_b_id = auth.jwt() ->> 'sub'
  );

CREATE POLICY "cofounder_links_update_own" ON cofounder_links
  FOR UPDATE
  USING (
    user_a_id = auth.jwt() ->> 'sub'
    OR user_b_id = auth.jwt() ->> 'sub'
  )
  WITH CHECK (
    user_a_id = auth.jwt() ->> 'sub'
    OR user_b_id = auth.jwt() ->> 'sub'
  );

CREATE POLICY "cofounder_links_delete_own" ON cofounder_links
  FOR DELETE
  USING (
    user_a_id = auth.jwt() ->> 'sub'
    OR user_b_id = auth.jwt() ->> 'sub'
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Batch 3 write guards applied: profiles (regression fix), match_intents, cofounder_invites, messages (sender check), cofounder_links (defense-in-depth).';
END $$;
