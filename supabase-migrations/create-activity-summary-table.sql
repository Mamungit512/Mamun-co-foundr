-- Migration: Create User Activity Summary Table
-- Description: Separate table for activity metrics with dual-update strategy
-- Run this in your Supabase SQL Editor
--
-- DATA FLOW:
-- 1. Middleware (Real-time): Updates last_active_at on every authenticated page request
-- 2. PostHog (Client-side): Captures detailed events (logins, actions, etc.)
-- 3. Cron Job (Daily): Syncs login counts from PostHog, preserving recent last_active_at
--
-- This ensures:
-- - Real-time activity tracking for profile filtering
-- - Accurate login analytics from PostHog
-- - No data inconsistency between sources

-- Create user_activity_summary table
CREATE TABLE IF NOT EXISTS user_activity_summary (
  user_id TEXT PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
  last_active_at TIMESTAMP WITH TIME ZONE,
  total_login_count INTEGER DEFAULT 0,
  last_login_at TIMESTAMP WITH TIME ZONE,
  logins_last_7_days INTEGER DEFAULT 0,
  logins_last_30_days INTEGER DEFAULT 0,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast filtering by activity
CREATE INDEX IF NOT EXISTS idx_activity_summary_last_active
  ON user_activity_summary(last_active_at);

-- Index for JOIN performance with profiles table
CREATE INDEX IF NOT EXISTS idx_activity_summary_user_id
  ON user_activity_summary(user_id);

-- Add comments for documentation
COMMENT ON TABLE user_activity_summary IS 'Activity metrics with dual-update: middleware tracks real-time activity, cron syncs PostHog analytics';
COMMENT ON COLUMN user_activity_summary.last_active_at IS 'Last time user had any activity (updated real-time by middleware + daily sync from PostHog)';
COMMENT ON COLUMN user_activity_summary.total_login_count IS 'Total number of logins (synced from PostHog daily)';
COMMENT ON COLUMN user_activity_summary.last_login_at IS 'Last login timestamp (synced from PostHog daily)';
COMMENT ON COLUMN user_activity_summary.logins_last_7_days IS 'Number of logins in last 7 days (synced from PostHog daily)';
COMMENT ON COLUMN user_activity_summary.logins_last_30_days IS 'Number of logins in last 30 days (synced from PostHog daily)';
COMMENT ON COLUMN user_activity_summary.last_synced_at IS 'When this record was last synced from PostHog (cron job timestamp)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ user_activity_summary table created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Data Sources:';
  RAISE NOTICE '1. Middleware: Updates last_active_at on every authenticated page request (real-time)';
  RAISE NOTICE '2. Cron Job: Syncs login counts and PostHog events daily at 2 AM UTC';
  RAISE NOTICE '3. Merge Strategy: Keeps most recent last_active_at between middleware and PostHog';
  RAISE NOTICE '';
  RAISE NOTICE 'Usage:';
  RAISE NOTICE '- Profile matching queries this table for activity-based filtering';
  RAISE NOTICE '- Activity data is always fresh (middleware updates on every request)';
  RAISE NOTICE '- Login analytics from PostHog provide deeper insights';
  RAISE NOTICE '';
  RAISE NOTICE 'Example query:';
  RAISE NOTICE 'SELECT p.*, a.last_active_at, a.total_login_count FROM profiles p';
  RAISE NOTICE 'INNER JOIN user_activity_summary a ON p.user_id = a.user_id';
  RAISE NOTICE 'WHERE a.last_active_at > NOW() - INTERVAL ''30 days'';';
END $$;
