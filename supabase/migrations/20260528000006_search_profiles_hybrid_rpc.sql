CREATE OR REPLACE FUNCTION search_profiles_hybrid(
  eligible_ids text[],
  query_text   text,
  query_vec    vector(384)
) RETURNS TABLE (user_id text, rrf_score real)
LANGUAGE sql STABLE AS $$
  WITH
  q_tsv AS (SELECT to_tsquery('english', query_text) AS q),

  -- Branch 1: keyword FTS on profiles (title, bio, startup, interests, city)
  fts_top AS (
    SELECT p.user_id,
           row_number() OVER (ORDER BY ts_rank(p.search_tsv, q.q) DESC) AS rk
    FROM profiles p, q_tsv q
    WHERE p.user_id = ANY(eligible_ids)
      AND p.deleted_at IS NULL
      AND p.search_tsv @@ q.q
    ORDER BY ts_rank(p.search_tsv, q.q) DESC
    LIMIT 100
  ),

  -- Branch 2: keyword FTS on school_profiles (major, college, sector_interests)
  school_fts_top AS (
    SELECT sp.user_id,
           row_number() OVER (ORDER BY ts_rank(sp.search_tsv, q.q) DESC) AS rk
    FROM school_profiles sp, q_tsv q
    WHERE sp.user_id = ANY(eligible_ids)
      AND sp.search_tsv @@ q.q
    ORDER BY ts_rank(sp.search_tsv, q.q) DESC
    LIMIT 100
  ),

  -- Branch 3: semantic vector similarity (cosine distance)
  -- Only includes profiles that have been embedded; others fall through to other branches
  vec_top AS (
    SELECT p.user_id,
           row_number() OVER (ORDER BY p.embedding <=> query_vec) AS rk
    FROM profiles p
    WHERE p.user_id = ANY(eligible_ids)
      AND p.deleted_at IS NULL
      AND p.embedding IS NOT NULL
    ORDER BY p.embedding <=> query_vec
    LIMIT 100
  ),

  -- Branch 4: partial name match (handles "Jo" → "John" that FTS/vector miss)
  name_top AS (
    SELECT p.user_id,
           row_number() OVER (ORDER BY p.user_id) AS rk
    FROM profiles p
    WHERE p.user_id = ANY(eligible_ids)
      AND p.deleted_at IS NULL
      AND (p.first_name ILIKE '%' || query_text || '%'
        OR p.last_name  ILIKE '%' || query_text || '%')
    LIMIT 50
  ),

  -- Combine all branches — each row is (user_id, rank_within_branch)
  combined AS (
    SELECT user_id, rk FROM fts_top
    UNION ALL SELECT user_id, rk FROM school_fts_top
    UNION ALL SELECT user_id, rk FROM vec_top
    UNION ALL SELECT user_id, rk FROM name_top
  )

  -- RRF: sum 1/(60+rank) across all branches a profile appears in
  SELECT user_id, SUM(1.0 / (60 + rk))::real AS rrf_score
  FROM combined
  GROUP BY user_id
  ORDER BY rrf_score DESC
  LIMIT 30;
$$;
