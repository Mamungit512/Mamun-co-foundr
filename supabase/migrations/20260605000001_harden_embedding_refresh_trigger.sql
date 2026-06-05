-- Fix: "permission denied for schema pgmq" on profile upsert.
--
-- enqueue_embedding_refresh() fires from INSERT/UPDATE on profiles and
-- school_profiles. The upsert runs as the `service_role` role (the API uses the
-- Supabase service-role key), which lacks USAGE on the internal pgmq schema, so
-- the pgmq.send() call inside the trigger fails and aborts the whole upsert.
--
-- Re-declare the function as SECURITY DEFINER so it executes with the privileges
-- of its owner (postgres, which has pgmq access) regardless of which role fires
-- the trigger. SET search_path = '' pins the resolution path to prevent
-- search_path-hijacking privilege escalation — safe here because every external
-- call below is already fully schema-qualified (pgmq.send, net.http_post) and
-- the built-ins resolve from pg_catalog, which is always searched first.

CREATE OR REPLACE FUNCTION enqueue_embedding_refresh()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_edge_url text := current_setting('app.embed_fn_url', true);
  v_edge_token text := current_setting('app.edge_fn_token', true);
BEGIN
  -- Enqueue the user_id for re-embedding (durable queue)
  PERFORM pgmq.send('embedding_refresh',
    jsonb_build_object('user_id', NEW.user_id));

  -- Nudge the Edge Function immediately if configured (sub-minute freshness)
  IF v_edge_url IS NOT NULL AND v_edge_token IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_edge_url,
      body := jsonb_build_object('mode', 'drain'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_edge_token
      ));
  END IF;

  RETURN NEW;
END;
$$;
