CREATE TABLE profile_views (
  id              bigserial PRIMARY KEY,
  viewer_user_id  text NOT NULL,
  target_user_id  text NOT NULL,
  viewed_at       timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (viewer_user_id, target_user_id)
);

CREATE INDEX idx_profile_views_target_viewed
  ON profile_views (target_user_id, viewed_at);

COMMENT ON TABLE profile_views IS 'First-time engaged profile views (dwell >10s AND scroll-to-bottom). One row per (viewer, target) pair — viewed_at frozen on first qualifying view.';

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
