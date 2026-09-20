-- Migration: Constrain likes.liker_id / likes.liked_id to the Clerk user-id shape
-- likes.liker_id and likes.liked_id are bare `text` columns with no FK and no
-- format check. POST /api/like now validates the shape server-side (see
-- src/lib/validation.ts), but the DB should not rely on the app layer alone —
-- GET /api/profiles previously string-concatenated liked_id values, unescaped,
-- into a raw PostgREST `.not(col, "in", "(...)")` filter. A CHECK constraint
-- closes the same hole for any other write path (service-role scripts,
-- future routes) that doesn't go through the validated API.
--
-- Clean up any rows that would violate the new constraint before adding it.
DELETE FROM likes
WHERE liker_id !~ '^user_[A-Za-z0-9]+$'
   OR liked_id !~ '^user_[A-Za-z0-9]+$';

ALTER TABLE likes
  ADD CONSTRAINT likes_liker_id_format_check
  CHECK (liker_id ~ '^user_[A-Za-z0-9]+$');

ALTER TABLE likes
  ADD CONSTRAINT likes_liked_id_format_check
  CHECK (liked_id ~ '^user_[A-Za-z0-9]+$');

DO $$ BEGIN RAISE NOTICE '✅ likes.liker_id / likes.liked_id constrained to the Clerk user-id shape'; END $$;
