-- Migration: Add seen_at to matching_queue
-- Tracks when a profile card was first viewed by the user

ALTER TABLE matching_queue ADD COLUMN IF NOT EXISTS seen_at timestamptz;

COMMENT ON COLUMN matching_queue.seen_at IS 'When the viewer first saw this profile card. NULL = unseen ("New" badge).';
