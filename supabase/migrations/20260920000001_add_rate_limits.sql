-- Migration: Add rate_limits table + atomic increment function
-- Backs the shared rate limiter in src/lib/rateLimit.ts. A fixed-window
-- counter keyed by (key, window_start), where `key` is something like
-- "send:user_abc123" or "send:ip:203.0.113.4". Postgres-backed rather than
-- in-memory so it works correctly across Vercel's multiple serverless
-- instances (the in-memory Map in parse-resume/route.ts did not).

CREATE TABLE IF NOT EXISTS "public"."rate_limits" (
  "key" text NOT NULL,
  "window_start" timestamptz NOT NULL,
  "count" integer NOT NULL DEFAULT 0,
  PRIMARY KEY ("key", "window_start")
);

ALTER TABLE "public"."rate_limits" ENABLE ROW LEVEL SECURITY;
-- No policies are added on purpose: rate_limits is written and read only by
-- the service-role client (src/lib/rateLimit.ts), which bypasses RLS. No
-- authenticated or anon-role access is intended.

-- Supports periodic cleanup of expired windows (e.g. `DELETE FROM rate_limits
-- WHERE window_start < now() - interval '1 day'`), which is not yet scheduled
-- anywhere — the table is small enough that this is a later optimization.
CREATE INDEX IF NOT EXISTS "rate_limits_window_start_idx"
  ON "public"."rate_limits" ("window_start");

-- Atomically increments the counter for (key, window_start) and returns the
-- new count, so concurrent requests in the same window can't race a
-- read-then-write and undercount.
CREATE OR REPLACE FUNCTION "public"."increment_rate_limit"(
  "p_key" text,
  "p_window_start" timestamptz
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, p_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO new_count;

  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION "public"."increment_rate_limit"(text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "public"."increment_rate_limit"(text, timestamptz) TO service_role;

DO $$ BEGIN RAISE NOTICE '✅ rate_limits table + increment_rate_limit() created'; END $$;
