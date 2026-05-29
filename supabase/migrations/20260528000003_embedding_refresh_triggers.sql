-- Trigger function to enqueue embedding refresh and nudge Edge Function
CREATE OR REPLACE FUNCTION enqueue_embedding_refresh()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger on profiles: fire when search_tsv changes (indicates text content changed)
DROP TRIGGER IF EXISTS profiles_embedding_refresh ON profiles;
CREATE TRIGGER profiles_embedding_refresh
  AFTER INSERT OR UPDATE OF search_tsv ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION enqueue_embedding_refresh();

-- Trigger on school_profiles: fire when search_tsv changes, re-embed the parent user
DROP TRIGGER IF EXISTS school_profiles_embedding_refresh ON school_profiles;
CREATE TRIGGER school_profiles_embedding_refresh
  AFTER INSERT OR UPDATE OF search_tsv ON school_profiles
  FOR EACH ROW
  EXECUTE FUNCTION enqueue_embedding_refresh();
