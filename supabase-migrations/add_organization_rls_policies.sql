-- Migration: Row Level Security — Organization Tenant Isolation
-- Description: Adds RLS policies so that:
--   - General users (no organization_id in JWT) only see null-org rows.
--   - School users (organization_id in JWT) only see rows from their own school.
--
-- IMPORTANT: The app currently uses the Supabase SERVICE_ROLE_KEY for most API
--   routes, which bypasses RLS. These policies act as defense-in-depth for any
--   client-side / anon-key queries. Service-role routes enforce org scoping at
--   the application layer (see profiles/route.ts and other API routes).
--
-- Prerequisite: Clerk must be configured as a Supabase third-party auth provider
--   so that auth.jwt() returns the full Clerk session claims, including
--   metadata.organization_id.
--
-- Run AFTER add_organization_id_to_profiles.sql

-- ============================================================
-- Helper: extract organization_id from the Clerk JWT claim
-- ============================================================
-- Clerk's JWT template maps publicMetadata to the "metadata" key.
-- organization_id lives at: jwt -> 'metadata' -> 'organization_id'
CREATE OR REPLACE FUNCTION auth.organization_id() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(auth.jwt() -> 'metadata' ->> 'organization_id', '')::uuid
$$;

-- ============================================================
-- profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_org_isolation" ON profiles;
CREATE POLICY "profiles_org_isolation" ON profiles
  FOR ALL
  USING (
    -- General pool user sees only null-org profiles
    (auth.organization_id() IS NULL AND organization_id IS NULL)
    OR
    -- School user sees only profiles in their school
    (auth.organization_id() IS NOT NULL AND organization_id = auth.organization_id())
  );

-- ============================================================
-- likes
-- ============================================================
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "likes_org_isolation" ON likes;
CREATE POLICY "likes_org_isolation" ON likes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = likes.liker_id
        AND (
          (auth.organization_id() IS NULL AND p.organization_id IS NULL)
          OR (auth.organization_id() IS NOT NULL AND p.organization_id = auth.organization_id())
        )
    )
  );

-- ============================================================
-- user_profile_actions
-- ============================================================
ALTER TABLE user_profile_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profile_actions_org_isolation" ON user_profile_actions;
CREATE POLICY "user_profile_actions_org_isolation" ON user_profile_actions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = user_profile_actions.actor_profile_id
        AND (
          (auth.organization_id() IS NULL AND p.organization_id IS NULL)
          OR (auth.organization_id() IS NOT NULL AND p.organization_id = auth.organization_id())
        )
    )
  );

-- ============================================================
-- matching_queue
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
          (auth.organization_id() IS NULL AND p.organization_id IS NULL)
          OR (auth.organization_id() IS NOT NULL AND p.organization_id = auth.organization_id())
        )
    )
  );

-- ============================================================
-- conversations
-- ============================================================
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
          (auth.organization_id() IS NULL AND p.organization_id IS NULL)
          OR (auth.organization_id() IS NOT NULL AND p.organization_id = auth.organization_id())
        )
    )
  );

-- ============================================================
-- conversation_participants
-- ============================================================
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversation_participants_org_isolation" ON conversation_participants;
CREATE POLICY "conversation_participants_org_isolation" ON conversation_participants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = conversation_participants.user_id
        AND (
          (auth.organization_id() IS NULL AND p.organization_id IS NULL)
          OR (auth.organization_id() IS NOT NULL AND p.organization_id = auth.organization_id())
        )
    )
  );

-- ============================================================
-- messages
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
          (auth.organization_id() IS NULL AND p.organization_id IS NULL)
          OR (auth.organization_id() IS NOT NULL AND p.organization_id = auth.organization_id())
        )
    )
  );

-- ============================================================
-- organizations (read-only for authenticated users)
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_read_own" ON organizations;
CREATE POLICY "organizations_read_own" ON organizations
  FOR SELECT
  USING (
    id = auth.organization_id()
  );

DO $$
BEGIN
  RAISE NOTICE '✅ RLS organization isolation policies applied to all tables.';
END $$;
