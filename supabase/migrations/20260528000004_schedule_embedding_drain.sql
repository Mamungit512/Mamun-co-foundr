-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the embedding drain to run every minute
-- This serves as a safety net for missed trigger nudges and keeps the Edge Function worker warm
-- Prerequisites: app.embed_fn_url and app.edge_fn_token must be set as Postgres parameters in Supabase dashboard
SELECT cron.schedule(
  'embed-drain',
  '* * * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.embed_fn_url'),
      body := jsonb_build_object('mode', 'drain'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.edge_fn_token')
      )
    );
  $$
);
