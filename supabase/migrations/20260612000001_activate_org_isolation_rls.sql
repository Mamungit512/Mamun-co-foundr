-- Migration: Activate organization-isolation RLS on the core tables
--
-- The baseline dump (= live prod schema) shows the core tables NEVER received
-- org-isolation policies: profiles/likes/conversations/conversation_participants/
-- user_profile_actions still carry legacy permissive policies ("Allow read for
-- all", "Public profiles are viewable by everyone", …), and messages/
-- matching_queue have RLS enabled with no policy (deny-all). Only the newer
-- tables (match_intents, cofounder_*, school_profiles) ever got org isolation.
--
-- This migration makes org isolation real on the core tables. It must do BOTH:
--   1. DROP the legacy permissive policies. Postgres OR-combines permissive
--      policies, so a surviving `USING (true)` policy silently defeats isolation.
--   2. CREATE the org-scoped policies.
--
-- The org claim is read inline as NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id','')
-- (no auth.organization_id() helper) to match the match_intents/cofounder
-- convention and avoid needing CREATE privileges in the auth schema on push.
--
-- ⚠️ DEPLOY ORDER: pair this with enabling [auth.third_party.clerk] (Stage 2).
-- Pushed to prod alone it is still safe for the general pool (null-claim anon
-- sees null-org rows, which is what general profiles are), but school users only
-- become correctly scoped once their Clerk token carries metadata.organization_id.

-- ============================================================
-- profiles  (direct org column)
-- ============================================================
DROP POLICY IF EXISTS "Allow read for all" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Allow update for owner" ON profiles;
DROP POLICY IF EXISTS "Allow insert for owner or admin" ON profiles;
DROP POLICY IF EXISTS "Allow delete for owner" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_org_isolation" ON profiles;
CREATE POLICY "profiles_org_isolation" ON profiles
  FOR ALL
  USING (
    (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
      AND organization_id IS NULL)
    OR
    (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
      AND organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid)
  );

-- ============================================================
-- likes  (no org column → scope via the liker's profile)
-- ============================================================
DROP POLICY IF EXISTS "Allow select for owner" ON likes;
DROP POLICY IF EXISTS "Allow insert for owner" ON likes;
DROP POLICY IF EXISTS "Allow delete for owner" ON likes;

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "likes_org_isolation" ON likes;
CREATE POLICY "likes_org_isolation" ON likes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = likes.liker_id
        AND (
          (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
            AND p.organization_id IS NULL)
          OR (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
            AND p.organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid)
        )
    )
  );

-- ============================================================
-- user_profile_actions  (scope via actor's profile)
-- ============================================================
DROP POLICY IF EXISTS "Users can insert their own actions" ON user_profile_actions;
DROP POLICY IF EXISTS "Users can view their own actions" ON user_profile_actions;

ALTER TABLE user_profile_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profile_actions_org_isolation" ON user_profile_actions;
CREATE POLICY "user_profile_actions_org_isolation" ON user_profile_actions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = user_profile_actions.user_id
        AND (
          (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
            AND p.organization_id IS NULL)
          OR (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
            AND p.organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid)
        )
    )
  );

-- ============================================================
-- matching_queue  (scope via viewer's profile)
-- ============================================================
ALTER TABLE matching_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matching_queue_org_isolation" ON matching_queue;
CREATE POLICY "matching_queue_org_isolation" ON matching_queue
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = matching_queue.viewer_user_id
        AND (
          (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
            AND p.organization_id IS NULL)
          OR (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
            AND p.organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid)
        )
    )
  );

-- ============================================================
-- conversations  (participant must share the viewer's org)
-- ============================================================
DROP POLICY IF EXISTS "Allow select for participants" ON conversations;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_org_isolation" ON conversations;
CREATE POLICY "conversations_org_isolation" ON conversations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM conversation_participants cp
      JOIN profiles p ON p.user_id = cp.user_id
      WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.jwt() ->> 'sub'
        AND (
          (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
            AND p.organization_id IS NULL)
          OR (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
            AND p.organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid)
        )
    )
  );

-- ============================================================
-- conversation_participants  (scope via own profile)
-- ============================================================
DROP POLICY IF EXISTS "Insert own conversation_participant" ON conversation_participants;
DROP POLICY IF EXISTS "Select own conversation_participant" ON conversation_participants;

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversation_participants_org_isolation" ON conversation_participants;
CREATE POLICY "conversation_participants_org_isolation" ON conversation_participants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = conversation_participants.user_id
        AND (
          (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NULL
            AND p.organization_id IS NULL)
          OR (NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '') IS NOT NULL
            AND p.organization_id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid)
        )
    )
  );

-- ============================================================
-- messages  (sender/participant must share the viewer's org)
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_org_isolation" ON messages;
CREATE POLICY "messages_org_isolation" ON messages
  FOR ALL
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

-- ============================================================
-- organizations  (read only your own org)
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_read_own" ON organizations;
CREATE POLICY "organizations_read_own" ON organizations
  FOR SELECT
  USING (
    id = NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid
  );

-- ============================================================
-- profile_views  (owner-scoped; no org column, isolation is by user)
-- ============================================================
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_views_owner" ON profile_views;
CREATE POLICY "profile_views_owner" ON profile_views
  FOR ALL
  USING (viewer_user_id = auth.jwt() ->> 'sub')
  WITH CHECK (viewer_user_id = auth.jwt() ->> 'sub');

-- ============================================================
-- school_profiles  (fix uuid-cast that breaks under Clerk subs)
-- ============================================================
DROP POLICY IF EXISTS "school_profiles_own_row" ON school_profiles;
CREATE POLICY "school_profiles_own_row" ON school_profiles
  FOR ALL
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

DO $$
BEGIN
  RAISE NOTICE '✅ Org-isolation RLS activated on core tables (legacy permissive policies dropped).';
END $$;
