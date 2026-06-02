-- Backfill: enqueue all existing non-deleted profiles for embedding
-- Run this after the Edge Function is deployed and ready to process the queue
SELECT pgmq.send_batch(
  'embedding_refresh',
  ARRAY(
    SELECT jsonb_build_object('user_id', user_id)
    FROM profiles
    WHERE deleted_at IS NULL
  )
);
