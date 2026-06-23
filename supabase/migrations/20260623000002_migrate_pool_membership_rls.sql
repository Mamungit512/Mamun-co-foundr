-- Migration: Migrate — pool-membership RLS
--
-- Replaces the single-JWT-org-claim predicate on every pooling policy with
-- predicates keyed on profile_pool_memberships. This is a security-posture
-- change: pool isolation moves from a static JWT claim to membership data.
--
-- ⚠️  REQUIRES: 20260623000001_expand_profile_pool_memberships.sql applied first.
--
-- Groups:
--  A) profiles         — shared-membership EXISTS (viewer and target share a pool)
--  B) Relationship/ownership tables (likes, matching_queue, conversations,
--     conversation_participants, messages) — drop org-claim predicate entirely;
--     ownership/participant check is the gate and the new profiles RLS backs it.
--  C) School-only tables (match_intents, cofounder_invites, cofounder_links,
--     school_profiles) — org-claim → membership EXISTS for the row's org.
--  D) user_activity_summary — shared-membership EXISTS (same as profiles).

-- ============================================================
-- A) profiles — shared-membership SELECT
--    A profile is visible if the viewer shares ≥1 pool with the target,
--    or the viewer is reading their own row (needed during onboarding before
--    their membership row exists).
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_org" ON profiles;

CREATE POLICY "profiles_select_org" ON profiles
  FOR SELECT
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR EXISTS (
      SELECT 1
      FROM profile_pool_memberships viewer_m
      JOIN profile_pool_memberships target_m
        ON target_m.user_id = profiles.user_id
       AND target_m.organization_id IS NOT DISTINCT FROM viewer_m.organization_id
      WHERE viewer_m.user_id = auth.jwt() ->> 'sub'
    )
  );

-- INSERT / UPDATE / DELETE remain owner-only — no change needed.

-- ============================================================
-- B) Relationship / ownership tables — drop org-claim predicate
--    The profiles_select_org policy above already ensures users can only
--    reach profiles they share a pool with. Org isolation on these tables
--    is redundant and blocks cross-pool relationships for dual-pool users.
-- ============================================================

-- likes
DROP POLICY IF EXISTS "likes_org_isolation" ON likes;

CREATE POLICY "likes_owner" ON likes
  FOR ALL
  USING  (liker_id = auth.jwt() ->> 'sub' OR liked_id = auth.jwt() ->> 'sub')
  WITH CHECK (liker_id = auth.jwt() ->> 'sub');

-- matching_queue
DROP POLICY IF EXISTS "matching_queue_org_isolation" ON matching_queue;

CREATE POLICY "matching_queue_owner" ON matching_queue
  FOR ALL
  USING  (viewer_user_id = auth.jwt() ->> 'sub')
  WITH CHECK (viewer_user_id = auth.jwt() ->> 'sub');

-- conversations
DROP POLICY IF EXISTS "conversations_org_isolation" ON conversations;

CREATE POLICY "conversations_participant" ON conversations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.jwt() ->> 'sub'
    )
  );

-- conversation_participants
DROP POLICY IF EXISTS "conversation_participants_org_isolation" ON conversation_participants;

CREATE POLICY "conversation_participants_owner" ON conversation_participants
  FOR ALL
  USING  (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- messages — replace batch3's org-scoped participant check with simple participant check
DROP POLICY IF EXISTS "messages_select_participant" ON messages;
DROP POLICY IF EXISTS "messages_insert_own"          ON messages;

CREATE POLICY "messages_select_participant" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.jwt() ->> 'sub'
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
-- C) School-only tables — org-claim → membership EXISTS
--    A row is visible if the viewer has a membership row for that org.
-- ============================================================

-- match_intents
DROP POLICY IF EXISTS "match_intents_select_org" ON match_intents;

CREATE POLICY "match_intents_select_org" ON match_intents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profile_pool_memberships ppm
      WHERE ppm.user_id = auth.jwt() ->> 'sub'
        AND ppm.organization_id IS NOT DISTINCT FROM match_intents.organization_id
    )
  );

-- cofounder_invites
DROP POLICY IF EXISTS "cofounder_invites_select_org" ON cofounder_invites;

CREATE POLICY "cofounder_invites_select_org" ON cofounder_invites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profile_pool_memberships ppm
      WHERE ppm.user_id = auth.jwt() ->> 'sub'
        AND ppm.organization_id IS NOT DISTINCT FROM cofounder_invites.organization_id
    )
  );

-- cofounder_links
DROP POLICY IF EXISTS "cofounder_links_select_org" ON cofounder_links;

CREATE POLICY "cofounder_links_select_org" ON cofounder_links
  FOR SELECT
  USING (
    user_a_id = auth.jwt() ->> 'sub'
    OR user_b_id = auth.jwt() ->> 'sub'
    OR EXISTS (
      SELECT 1 FROM profile_pool_memberships ppm
      WHERE ppm.user_id = auth.jwt() ->> 'sub'
        AND ppm.organization_id IS NOT DISTINCT FROM cofounder_links.organization_id
    )
  );

-- school_profiles — own row OR org membership
DROP POLICY IF EXISTS "school_profiles_select_org" ON school_profiles;

CREATE POLICY "school_profiles_select_org" ON school_profiles
  FOR SELECT
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR EXISTS (
      SELECT 1 FROM profile_pool_memberships ppm
      WHERE ppm.user_id = auth.jwt() ->> 'sub'
        AND ppm.organization_id = school_profiles.organization_id
    )
  );

-- ============================================================
-- D) user_activity_summary — shared-membership EXISTS (mirrors profiles)
-- ============================================================
DROP POLICY IF EXISTS "user_activity_summary_org_isolation" ON user_activity_summary;

CREATE POLICY "user_activity_summary_org_isolation" ON user_activity_summary
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR EXISTS (
      SELECT 1
      FROM profile_pool_memberships viewer_m
      JOIN profile_pool_memberships target_m
        ON target_m.user_id = user_activity_summary.user_id
       AND target_m.organization_id IS NOT DISTINCT FROM viewer_m.organization_id
      WHERE viewer_m.user_id = auth.jwt() ->> 'sub'
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Migrate: RLS switched from single-JWT-org-claim to pool-membership for profiles, likes, matching_queue, conversations, conversation_participants, messages, match_intents, cofounder_invites, cofounder_links, school_profiles, user_activity_summary.';
END $$;
