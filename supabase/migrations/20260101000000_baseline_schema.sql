


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';


-- ─────────────────────────────────────────────────────────────────────────
-- Extensions
-- `supabase db dump --schema public` omits CREATE EXTENSION statements, so
-- they are re-added here. pgvector MUST live in `public` because columns and
-- functions reference the `public.vector` type. pgmq + pg_net back the
-- embedding-refresh trigger (pgmq.send / net.http_post).
--
-- Note: search_path is blanked AFTER extensions. pgmq and pg_net install
-- into their own hard-coded schemas (pgmq / net) and fail with 3F000 if
-- search_path is empty at install time.
-- ─────────────────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS "extensions";

CREATE EXTENSION IF NOT EXISTS "vector"   WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgmq";
CREATE EXTENSION IF NOT EXISTS "pg_net";

SELECT pg_catalog.set_config('search_path', '', false);



CREATE TYPE IF NOT EXISTS "public"."battery_level_enum" AS ENUM (
    'Energized',
    'Content',
    'Burnt out'
);


ALTER TYPE "public"."battery_level_enum" OWNER TO "postgres";


CREATE TYPE IF NOT EXISTS "public"."cofounder_status_enum" AS ENUM (
    'Solo founder',
    'Have co-founder(s)',
    'Seeking co-founder'
);


ALTER TYPE "public"."cofounder_status_enum" OWNER TO "postgres";


CREATE TYPE IF NOT EXISTS "public"."founder_archetype" AS ENUM (
    'the_scaler',
    'the_steward',
    'the_architect'
);


ALTER TYPE "public"."founder_archetype" OWNER TO "postgres";


CREATE TYPE IF NOT EXISTS "public"."fulltime_timeline_enum" AS ENUM (
    'Already full-time',
    'Within 1 month',
    'Within 3 months',
    'Within 6 months',
    'Within 1 year',
    'Unsure'
);


ALTER TYPE "public"."fulltime_timeline_enum" OWNER TO "postgres";


CREATE TYPE IF NOT EXISTS "public"."satisfaction_level" AS ENUM (
    'Happy',
    'Browsing',
    'Content',
    'Unhappy'
);


ALTER TYPE "public"."satisfaction_level" OWNER TO "postgres";


CREATE TYPE IF NOT EXISTS "public"."startup_funding_enum" AS ENUM (
    'Bootstrapped',
    'Pre-seed',
    'Seed',
    'Series A+',
    'Grant funded',
    'Other',
    'Waiting on ECC funding'
);


ALTER TYPE "public"."startup_funding_enum" OWNER TO "postgres";


CREATE TYPE IF NOT EXISTS "public"."startup_time_spent_enum" AS ENUM (
    'Just started',
    '1-3 months',
    '3-6 months',
    '6-12 months',
    '1-2 years',
    '2+ years'
);


ALTER TYPE "public"."startup_time_spent_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cofounder_links_enforce_one_per_user"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM cofounder_links
    WHERE user_a_id = NEW.user_a_id OR user_b_id = NEW.user_a_id
       OR user_a_id = NEW.user_b_id OR user_b_id = NEW.user_b_id
  ) THEN
    RAISE EXCEPTION
      'User already has an active co-founder link'
      USING ERRCODE = 'unique_violation';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."cofounder_links_enforce_one_per_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cofounder_links_enforce_same_org"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  org_a uuid;
  org_b uuid;
BEGIN
  SELECT organization_id INTO org_a FROM profiles WHERE user_id = NEW.user_a_id;
  SELECT organization_id INTO org_b FROM profiles WHERE user_id = NEW.user_b_id;

  IF org_a IS DISTINCT FROM NEW.organization_id
     OR org_b IS DISTINCT FROM NEW.organization_id THEN
    RAISE EXCEPTION
      'cofounder_links.organization_id (%) must match both users'' organization_id (a=%, b=%)',
      NEW.organization_id, org_a, org_b
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."cofounder_links_enforce_same_org"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enqueue_embedding_refresh"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
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


ALTER FUNCTION "public"."enqueue_embedding_refresh"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_intents_enforce_same_org"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  from_org uuid;
  to_org   uuid;
BEGIN
  SELECT organization_id INTO from_org FROM profiles WHERE user_id = NEW.from_user_id;
  SELECT organization_id INTO to_org   FROM profiles WHERE user_id = NEW.to_user_id;

  IF from_org IS DISTINCT FROM NEW.organization_id
     OR to_org IS DISTINCT FROM NEW.organization_id THEN
    RAISE EXCEPTION
      'match_intents.organization_id (%) must match both users'' organization_id (from=%, to=%)',
      NEW.organization_id, from_org, to_org
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."match_intents_enforce_same_org"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."profiles_search_tsv_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.first_name, '') || ' ' || coalesce(NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.personal_intro, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.startup_name, '') || ' ' || coalesce(NEW.startup_description, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.accomplishments, '')), 'C') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(coalesce(NEW.priority_areas, '{}'), ' ')), 'C') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.interests, '') || ' ' || coalesce(NEW.hobbies, '')), 'D') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.city, '')), 'D');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."profiles_search_tsv_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."school_profiles_search_tsv_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.major, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.college, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, array_to_string(coalesce(NEW.sector_interests, '{}'), ' ')), 'A');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."school_profiles_search_tsv_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_profiles_hybrid"("eligible_ids" "text"[], "query_text" "text", "query_vec" "public"."vector") RETURNS TABLE("user_id" "text", "rrf_score" real)
    LANGUAGE "sql" STABLE
    AS $$
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


ALTER FUNCTION "public"."search_profiles_hybrid"("eligible_ids" "text"[], "query_text" "text", "query_vec" "public"."vector") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_organizations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_organizations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_school_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_school_profiles_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."access codes" (
    "id" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "access_code" "text"
);


ALTER TABLE "public"."access codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cofounder_invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "inviter_user_id" "text" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "invitee_email" "text" NOT NULL,
    "invitee_role" "text",
    "note" "text",
    "invitee_user_id" "text",
    "token" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '14 days'::interval) NOT NULL,
    "responded_at" timestamp with time zone,
    "notified_at" timestamp with time zone,
    CONSTRAINT "cofounder_invites_no_self" CHECK (("inviter_user_id" <> "invitee_user_id")),
    CONSTRAINT "cofounder_invites_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text", 'revoked'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."cofounder_invites" OWNER TO "postgres";


COMMENT ON TABLE "public"."cofounder_invites" IS 'Email-based co-founder invitations. One pending row per inviter+invitee-email. Accepted rows source a cofounder_links row.';



CREATE TABLE IF NOT EXISTS "public"."cofounder_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_a_id" "text" NOT NULL,
    "user_b_id" "text" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "source_invite_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "cofounder_links_check" CHECK (("user_a_id" <> "user_b_id"))
);


ALTER TABLE "public"."cofounder_links" OWNER TO "postgres";


COMMENT ON TABLE "public"."cofounder_links" IS 'Confirmed co-founder pairs. user_a_id < user_b_id ordering prevents duplicate rows. Query with OR on both columns.';



CREATE TABLE IF NOT EXISTS "public"."conversation_participants" (
    "conversation_id" "uuid" NOT NULL,
    "user_id" "text" NOT NULL
);


ALTER TABLE "public"."conversation_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_message_at" timestamp with time zone
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "liker_id" "text" NOT NULL,
    "liked_id" "text" NOT NULL
);


ALTER TABLE "public"."likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_intents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "from_user_id" "text" NOT NULL,
    "to_user_id" "text" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "we_match_notified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "match_intents_check" CHECK (("from_user_id" <> "to_user_id"))
);


ALTER TABLE "public"."match_intents" OWNER TO "postgres";


COMMENT ON TABLE "public"."match_intents" IS '"We Match" clicks. Each row = one user signaling explicit match intent on another. Mutual rows fire a transactional email; we_match_notified_at gates re-send.';



CREATE TABLE IF NOT EXISTS "public"."matching_queue" (
    "viewer_user_id" "text" NOT NULL,
    "candidate_user_id" "text" NOT NULL,
    "cycle" integer DEFAULT 0 NOT NULL,
    "last_action" "text",
    "last_action_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "seen_at" timestamp with time zone,
    CONSTRAINT "matching_queue_cycle_non_negative" CHECK (("cycle" >= 0)),
    CONSTRAINT "matching_queue_last_action_allowed" CHECK ((("last_action" IS NULL) OR ("last_action" = ANY (ARRAY['skip'::"text", 'like'::"text", 'pass'::"text"])))),
    CONSTRAINT "matching_queue_no_self_pair" CHECK (("viewer_user_id" <> "candidate_user_id"))
);


ALTER TABLE "public"."matching_queue" OWNER TO "postgres";


COMMENT ON TABLE "public"."matching_queue" IS 'Ordered matching deck per viewer; cycle increases when candidate is skipped (sent to back).';



COMMENT ON COLUMN "public"."matching_queue"."seen_at" IS 'When the viewer first saw this profile card. NULL = unseen ("New" badge).';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid",
    "sender_id" "text",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "type" "text" DEFAULT 'school'::"text" NOT NULL,
    "ferpa_dpa_signed_at" timestamp with time zone,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "allowed_email_domains" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "suppress_tracking" boolean DEFAULT true NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subdomain" "text"
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."organizations"."allowed_email_domains" IS 'Array of email domains that automatically map to this organization on signup. e.g. ARRAY[''mit.edu'', ''college.mit.edu'']. The user.created webhook checks this to assign publicMetadata.organization_id.';



COMMENT ON COLUMN "public"."organizations"."suppress_tracking" IS 'When true, PostHog and other third-party analytics are suppressed for all users belonging to this organization (required for FERPA compliance).';



CREATE TABLE IF NOT EXISTS "public"."profile_views" (
    "id" bigint NOT NULL,
    "viewer_user_id" "text" NOT NULL,
    "target_user_id" "text" NOT NULL,
    "viewed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profile_views" OWNER TO "postgres";


COMMENT ON TABLE "public"."profile_views" IS 'First-time engaged profile views (dwell >10s AND scroll-to-bottom). One row per (viewer, target) pair — viewed_at frozen on first qualifying view.';



CREATE SEQUENCE IF NOT EXISTS "public"."profile_views_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."profile_views_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."profile_views_id_seq" OWNED BY "public"."profile_views"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" integer NOT NULL,
    "user_id" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "city" "text" NOT NULL,
    "country" "text" NOT NULL,
    "satisfaction" "public"."satisfaction_level" NOT NULL,
    "gender" "text",
    "birthdate" "date",
    "personal_intro" "text" NOT NULL,
    "accomplishments" "text",
    "education" "text",
    "experience" "text",
    "is_technical" boolean NOT NULL,
    "linkedin" "text",
    "twitter" "text",
    "git" "text",
    "personal_website" "text",
    "has_startup" boolean NOT NULL,
    "startup_name" "text",
    "startup_description" "text",
    "startup_time_spent" "public"."startup_time_spent_enum",
    "startup_funding" "public"."startup_funding_enum",
    "cofounder_status" "public"."cofounder_status_enum",
    "fulltime_timeline" "public"."fulltime_timeline_enum",
    "responsibilities" "text"[],
    "interests" "text",
    "priority_areas" "text"[],
    "hobbies" "text",
    "onboarding_complete" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "title" "text" NOT NULL,
    "is_admin" boolean DEFAULT false NOT NULL,
    "pfp_url" "text",
    "deleted_at" timestamp with time zone,
    "permanent_delete_at" timestamp with time zone,
    "battery_level" "public"."battery_level_enum" DEFAULT 'Content'::"public"."battery_level_enum" NOT NULL,
    "equity_expectation" numeric(5,2),
    "looking_for" "text" DEFAULT 'either'::"text",
    "preferred_location" "text" DEFAULT 'remote'::"text",
    "is_hiring" boolean DEFAULT false,
    "hiring_email" "text",
    "intent_score" integer DEFAULT 0,
    "tier" "text" DEFAULT 'free'::"text",
    "state" "text",
    "archetype" "public"."founder_archetype",
    "organization_id" "uuid",
    "search_tsv" "tsvector",
    "embedding" "public"."vector"(384)
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."profiles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."profiles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."profiles_id_seq" OWNED BY "public"."profiles"."id";



CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "referred_user_id" "text",
    "fp_ref" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "referrer_code" "text",
    "status" "text",
    "referred_user_email" "text",
    "referrer_user_id" "text"
);


ALTER TABLE "public"."referrals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."school_profiles" (
    "id" bigint NOT NULL,
    "user_id" "text" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "school_status" "text" NOT NULL,
    "graduation_year" integer,
    "college" "text",
    "degree_type" "text",
    "major" "text",
    "sector_interests" "text"[],
    "additional_education" "text",
    "school_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "search_tsv" "tsvector",
    "intent" "text",
    CONSTRAINT "school_profiles_degree_type_check" CHECK (("degree_type" = ANY (ARRAY['bachelors'::"text", 'masters'::"text", 'professional'::"text", 'other'::"text"]))),
    CONSTRAINT "school_profiles_graduation_year_check" CHECK ((("graduation_year" >= 1900) AND ("graduation_year" <= 2100))),
    CONSTRAINT "school_profiles_intent_check" CHECK (("intent" = ANY (ARRAY['join_me'::"text", 'seeking_to_join'::"text", 'no_preference'::"text"]))),
    CONSTRAINT "school_profiles_school_status_check" CHECK (("school_status" = ANY (ARRAY['student'::"text", 'alumni'::"text"])))
);


ALTER TABLE "public"."school_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."school_profiles" IS 'Extension table for school-tenant onboarding (UT Austin and future schools). One row per school-onboarded user, linked to profiles.user_id. Presence acts as the "verified school user" gate for matching.';



CREATE SEQUENCE IF NOT EXISTS "public"."school_profiles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."school_profiles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."school_profiles_id_seq" OWNED BY "public"."school_profiles"."id";



CREATE TABLE IF NOT EXISTS "public"."user_activity_summary" (
    "user_id" "text" NOT NULL,
    "last_active_at" timestamp with time zone,
    "total_login_count" integer DEFAULT 0,
    "last_login_at" timestamp with time zone,
    "logins_last_7_days" integer DEFAULT 0,
    "logins_last_30_days" integer DEFAULT 0,
    "last_synced_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_activity_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_consents" (
    "id" bigint NOT NULL,
    "user_id" "text" NOT NULL,
    "organization_id" "uuid",
    "document" "text" NOT NULL,
    "version" "text" NOT NULL,
    "accepted_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_consents" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_consents_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_consents_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_consents_id_seq" OWNED BY "public"."user_consents"."id";



CREATE TABLE IF NOT EXISTS "public"."user_profile_actions" (
    "id" bigint NOT NULL,
    "user_id" "text" NOT NULL,
    "other_profile_id" "text" NOT NULL,
    "action_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_profile_actions" OWNER TO "postgres";


ALTER TABLE "public"."user_profile_actions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_profile_actions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."profile_views" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."profile_views_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."profiles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."profiles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."school_profiles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."school_profiles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_consents" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_consents_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."cofounder_invites"
    ADD CONSTRAINT "cofounder_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cofounder_invites"
    ADD CONSTRAINT "cofounder_invites_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."cofounder_links"
    ADD CONSTRAINT "cofounder_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cofounder_links"
    ADD CONSTRAINT "cofounder_links_user_a_id_user_b_id_key" UNIQUE ("user_a_id", "user_b_id");



ALTER TABLE ONLY "public"."match_intents"
    ADD CONSTRAINT "match_intents_from_user_id_to_user_id_key" UNIQUE ("from_user_id", "to_user_id");



ALTER TABLE ONLY "public"."match_intents"
    ADD CONSTRAINT "match_intents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matching_queue"
    ADD CONSTRAINT "matching_queue_pkey" PRIMARY KEY ("viewer_user_id", "candidate_user_id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_subdomain_key" UNIQUE ("subdomain");



ALTER TABLE ONLY "public"."profile_views"
    ADD CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_views"
    ADD CONSTRAINT "profile_views_viewer_user_id_target_user_id_key" UNIQUE ("viewer_user_id", "target_user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."school_profiles"
    ADD CONSTRAINT "school_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."school_profiles"
    ADD CONSTRAINT "school_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_profile_actions"
    ADD CONSTRAINT "unique_user_action_per_profile" UNIQUE ("user_id", "other_profile_id", "action_type");



ALTER TABLE ONLY "public"."user_consents"
    ADD CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profile_actions"
    ADD CONSTRAINT "user_profile_actions_pkey1" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "Access Codes_pkey" ON "public"."access codes" USING "btree" ("id");



CREATE UNIQUE INDEX "conversation_participants_pkey" ON "public"."conversation_participants" USING "btree" ("conversation_id", "user_id");



CREATE UNIQUE INDEX "conversations_pkey" ON "public"."conversations" USING "btree" ("id");



CREATE INDEX "idx_activity_summary_last_active" ON "public"."user_activity_summary" USING "btree" ("last_active_at");



CREATE INDEX "idx_activity_summary_user_id" ON "public"."user_activity_summary" USING "btree" ("user_id");



CREATE INDEX "idx_cofounder_invites_invitee_email" ON "public"."cofounder_invites" USING "btree" ("lower"("invitee_email"));



CREATE INDEX "idx_cofounder_invites_org_inviter" ON "public"."cofounder_invites" USING "btree" ("organization_id", "inviter_user_id");



CREATE UNIQUE INDEX "idx_cofounder_invites_pending_unique" ON "public"."cofounder_invites" USING "btree" ("inviter_user_id", "lower"("invitee_email")) WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_cofounder_invites_token" ON "public"."cofounder_invites" USING "btree" ("token");



CREATE INDEX "idx_cofounder_links_org_a" ON "public"."cofounder_links" USING "btree" ("organization_id", "user_a_id");



CREATE INDEX "idx_cofounder_links_org_b" ON "public"."cofounder_links" USING "btree" ("organization_id", "user_b_id");



CREATE INDEX "idx_match_intents_org_from" ON "public"."match_intents" USING "btree" ("organization_id", "from_user_id");



CREATE INDEX "idx_match_intents_org_mutual_lookup" ON "public"."match_intents" USING "btree" ("organization_id", "to_user_id", "from_user_id");



CREATE INDEX "idx_organizations_subdomain" ON "public"."organizations" USING "btree" ("subdomain");



CREATE INDEX "idx_profile_views_target_viewed" ON "public"."profile_views" USING "btree" ("target_user_id", "viewed_at");



CREATE INDEX "idx_profiles_organization_id" ON "public"."profiles" USING "btree" ("organization_id");



CREATE INDEX "idx_school_profiles_intent" ON "public"."school_profiles" USING "btree" ("organization_id", "intent");



CREATE INDEX "idx_school_profiles_org" ON "public"."school_profiles" USING "btree" ("organization_id");



CREATE INDEX "idx_school_profiles_sectors" ON "public"."school_profiles" USING "gin" ("sector_interests");



CREATE INDEX "idx_user_consents_lookup" ON "public"."user_consents" USING "btree" ("user_id", "document", "accepted_at" DESC);



CREATE INDEX "idx_user_consents_org" ON "public"."user_consents" USING "btree" ("organization_id", "document", "version");



CREATE INDEX "idx_user_profile_actions_created_at" ON "public"."user_profile_actions" USING "btree" ("created_at");



CREATE INDEX "idx_user_profile_actions_user_id" ON "public"."user_profile_actions" USING "btree" ("user_id");



CREATE UNIQUE INDEX "likes_pkey" ON "public"."likes" USING "btree" ("id");



CREATE UNIQUE INDEX "messages_pkey" ON "public"."messages" USING "btree" ("id");



CREATE UNIQUE INDEX "one_on_one_unique" ON "public"."conversation_participants" USING "btree" (LEAST("user_id", ("conversation_id")::"text"), GREATEST("user_id", ("conversation_id")::"text"));



CREATE UNIQUE INDEX "profiles_pkey" ON "public"."profiles" USING "btree" ("id");



CREATE INDEX "profiles_search_tsv_gin" ON "public"."profiles" USING "gin" ("search_tsv");



CREATE UNIQUE INDEX "profiles_user_id_key" ON "public"."profiles" USING "btree" ("user_id");



CREATE UNIQUE INDEX "referrals_pkey" ON "public"."referrals" USING "btree" ("id");



CREATE INDEX "school_profiles_search_tsv_gin" ON "public"."school_profiles" USING "gin" ("search_tsv");



CREATE UNIQUE INDEX "unique_like" ON "public"."likes" USING "btree" ("liker_id", "liked_id");



CREATE UNIQUE INDEX "user_activity_summary_pkey" ON "public"."user_activity_summary" USING "btree" ("user_id");



CREATE UNIQUE INDEX "user_profile_actions_pkey" ON "public"."user_profile_actions" USING "btree" ("id");



CREATE OR REPLACE TRIGGER "profiles_embedding_refresh" AFTER INSERT OR UPDATE OF "search_tsv" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."enqueue_embedding_refresh"();



CREATE OR REPLACE TRIGGER "profiles_search_tsv_trigger" BEFORE INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."profiles_search_tsv_update"();



CREATE OR REPLACE TRIGGER "school_profiles_embedding_refresh" AFTER INSERT OR UPDATE OF "search_tsv" ON "public"."school_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."enqueue_embedding_refresh"();



CREATE OR REPLACE TRIGGER "school_profiles_search_tsv_trigger" BEFORE INSERT OR UPDATE ON "public"."school_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."school_profiles_search_tsv_update"();



CREATE OR REPLACE TRIGGER "trg_cofounder_links_enforce_one_per_user" BEFORE INSERT ON "public"."cofounder_links" FOR EACH ROW EXECUTE FUNCTION "public"."cofounder_links_enforce_one_per_user"();



CREATE OR REPLACE TRIGGER "trg_cofounder_links_enforce_same_org" BEFORE INSERT OR UPDATE ON "public"."cofounder_links" FOR EACH ROW EXECUTE FUNCTION "public"."cofounder_links_enforce_same_org"();



CREATE OR REPLACE TRIGGER "trg_match_intents_enforce_same_org" BEFORE INSERT OR UPDATE ON "public"."match_intents" FOR EACH ROW EXECUTE FUNCTION "public"."match_intents_enforce_same_org"();



CREATE OR REPLACE TRIGGER "trg_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_organizations_updated_at"();



CREATE OR REPLACE TRIGGER "trg_school_profiles_updated_at" BEFORE UPDATE ON "public"."school_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_school_profiles_updated_at"();



ALTER TABLE ONLY "public"."cofounder_invites"
    ADD CONSTRAINT "cofounder_invites_invitee_user_id_fkey" FOREIGN KEY ("invitee_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cofounder_invites"
    ADD CONSTRAINT "cofounder_invites_inviter_user_id_fkey" FOREIGN KEY ("inviter_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cofounder_invites"
    ADD CONSTRAINT "cofounder_invites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cofounder_links"
    ADD CONSTRAINT "cofounder_links_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cofounder_links"
    ADD CONSTRAINT "cofounder_links_source_invite_id_fkey" FOREIGN KEY ("source_invite_id") REFERENCES "public"."cofounder_invites"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cofounder_links"
    ADD CONSTRAINT "cofounder_links_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cofounder_links"
    ADD CONSTRAINT "cofounder_links_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_activity_summary"
    ADD CONSTRAINT "fk_user_activity_profile" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_liked_id_fkey" FOREIGN KEY ("liked_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_liker_id_fkey" FOREIGN KEY ("liker_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_intents"
    ADD CONSTRAINT "match_intents_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_intents"
    ADD CONSTRAINT "match_intents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_intents"
    ADD CONSTRAINT "match_intents_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."school_profiles"
    ADD CONSTRAINT "school_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."school_profiles"
    ADD CONSTRAINT "school_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



CREATE POLICY "Allow delete for owner" ON "public"."likes" FOR DELETE USING (("liker_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Allow delete for owner" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("user_id" = ("auth"."uid"())::"text"));



CREATE POLICY "Allow insert for owner" ON "public"."likes" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'sub'::"text") = "liker_id"));



CREATE POLICY "Allow insert for owner or admin" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = ("auth"."uid"())::"text") OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."user_id" = ("auth"."uid"())::"text") AND ("p"."is_admin" = true))))));



CREATE POLICY "Allow read for all" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Allow select for owner" ON "public"."likes" FOR SELECT USING (("liker_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Allow select for participants" ON "public"."conversations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "conversations"."id") AND ("cp"."user_id" = ("auth"."uid"())::"text")))));



CREATE POLICY "Allow update for owner" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("user_id" = ("auth"."uid"())::"text")) WITH CHECK (("user_id" = ("auth"."uid"())::"text"));



CREATE POLICY "Insert own conversation_participant" ON "public"."conversation_participants" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = ("auth"."uid"())::"text"));



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Select own conversation_participant" ON "public"."conversation_participants" FOR SELECT TO "authenticated" USING (("user_id" = ("auth"."uid"())::"text"));



CREATE POLICY "Service role has full access" ON "public"."user_activity_summary" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Users can insert their own actions" ON "public"."user_profile_actions" FOR INSERT WITH CHECK (("user_id" = ( SELECT ("profiles"."id")::"text" AS "id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((("auth"."uid"())::"text" = "user_id"));



CREATE POLICY "Users can view others activity for matching" ON "public"."user_activity_summary" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view their own actions" ON "public"."user_profile_actions" FOR SELECT USING (("user_id" = ( SELECT ("profiles"."id")::"text" AS "id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Users can view their own activity" ON "public"."user_activity_summary" FOR SELECT TO "authenticated" USING ((("auth"."uid"())::"text" = "user_id"));



ALTER TABLE "public"."access codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cofounder_invites" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cofounder_invites_org_isolation" ON "public"."cofounder_invites" USING ((((NULLIF((("auth"."jwt"() -> 'metadata'::"text") ->> 'organization_id'::"text"), ''::"text") IS NULL) AND ("organization_id" IS NULL)) OR ((NULLIF((("auth"."jwt"() -> 'metadata'::"text") ->> 'organization_id'::"text"), ''::"text") IS NOT NULL) AND ("organization_id" = (NULLIF((("auth"."jwt"() -> 'metadata'::"text") ->> 'organization_id'::"text"), ''::"text"))::"uuid"))));



ALTER TABLE "public"."cofounder_links" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cofounder_links_org_isolation" ON "public"."cofounder_links" USING ((((NULLIF((("auth"."jwt"() -> 'metadata'::"text") ->> 'organization_id'::"text"), ''::"text") IS NULL) AND ("organization_id" IS NULL)) OR ((NULLIF((("auth"."jwt"() -> 'metadata'::"text") ->> 'organization_id'::"text"), ''::"text") IS NOT NULL) AND ("organization_id" = (NULLIF((("auth"."jwt"() -> 'metadata'::"text") ->> 'organization_id'::"text"), ''::"text"))::"uuid"))));



ALTER TABLE "public"."conversation_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_intents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "match_intents_org_isolation" ON "public"."match_intents" USING ((((NULLIF((("auth"."jwt"() -> 'metadata'::"text") ->> 'organization_id'::"text"), ''::"text") IS NULL) AND ("organization_id" IS NULL)) OR ((NULLIF((("auth"."jwt"() -> 'metadata'::"text") ->> 'organization_id'::"text"), ''::"text") IS NOT NULL) AND ("organization_id" = (NULLIF((("auth"."jwt"() -> 'metadata'::"text") ->> 'organization_id'::"text"), ''::"text"))::"uuid"))));



ALTER TABLE "public"."matching_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referrals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."school_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "school_profiles_own_row" ON "public"."school_profiles" USING (("user_id" = ("auth"."uid"())::"text")) WITH CHECK (("user_id" = ("auth"."uid"())::"text"));



ALTER TABLE "public"."user_activity_summary" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_consents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profile_actions" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."cofounder_links_enforce_one_per_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."cofounder_links_enforce_one_per_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cofounder_links_enforce_one_per_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cofounder_links_enforce_same_org"() TO "anon";
GRANT ALL ON FUNCTION "public"."cofounder_links_enforce_same_org"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cofounder_links_enforce_same_org"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enqueue_embedding_refresh"() TO "anon";
GRANT ALL ON FUNCTION "public"."enqueue_embedding_refresh"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enqueue_embedding_refresh"() TO "service_role";



GRANT ALL ON FUNCTION "public"."match_intents_enforce_same_org"() TO "anon";
GRANT ALL ON FUNCTION "public"."match_intents_enforce_same_org"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_intents_enforce_same_org"() TO "service_role";



GRANT ALL ON FUNCTION "public"."profiles_search_tsv_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."profiles_search_tsv_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."profiles_search_tsv_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."school_profiles_search_tsv_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."school_profiles_search_tsv_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."school_profiles_search_tsv_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_profiles_hybrid"("eligible_ids" "text"[], "query_text" "text", "query_vec" "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."search_profiles_hybrid"("eligible_ids" "text"[], "query_text" "text", "query_vec" "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_profiles_hybrid"("eligible_ids" "text"[], "query_text" "text", "query_vec" "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_organizations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_organizations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_organizations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_school_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_school_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_school_profiles_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."access codes" TO "anon";
GRANT ALL ON TABLE "public"."access codes" TO "authenticated";
GRANT ALL ON TABLE "public"."access codes" TO "service_role";



GRANT ALL ON TABLE "public"."cofounder_invites" TO "anon";
GRANT ALL ON TABLE "public"."cofounder_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."cofounder_invites" TO "service_role";



GRANT ALL ON TABLE "public"."cofounder_links" TO "anon";
GRANT ALL ON TABLE "public"."cofounder_links" TO "authenticated";
GRANT ALL ON TABLE "public"."cofounder_links" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_participants" TO "anon";
GRANT ALL ON TABLE "public"."conversation_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_participants" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."likes" TO "anon";
GRANT ALL ON TABLE "public"."likes" TO "authenticated";
GRANT ALL ON TABLE "public"."likes" TO "service_role";



GRANT ALL ON TABLE "public"."match_intents" TO "anon";
GRANT ALL ON TABLE "public"."match_intents" TO "authenticated";
GRANT ALL ON TABLE "public"."match_intents" TO "service_role";



GRANT ALL ON TABLE "public"."matching_queue" TO "anon";
GRANT ALL ON TABLE "public"."matching_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."matching_queue" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."profile_views" TO "anon";
GRANT ALL ON TABLE "public"."profile_views" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_views" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profile_views_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profile_views_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profile_views_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."referrals" TO "anon";
GRANT ALL ON TABLE "public"."referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."referrals" TO "service_role";



GRANT ALL ON TABLE "public"."school_profiles" TO "anon";
GRANT ALL ON TABLE "public"."school_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."school_profiles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."school_profiles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."school_profiles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."school_profiles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_activity_summary" TO "anon";
GRANT ALL ON TABLE "public"."user_activity_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activity_summary" TO "service_role";



GRANT ALL ON TABLE "public"."user_consents" TO "anon";
GRANT ALL ON TABLE "public"."user_consents" TO "authenticated";
GRANT ALL ON TABLE "public"."user_consents" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_consents_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_consents_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_consents_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_profile_actions" TO "anon";
GRANT ALL ON TABLE "public"."user_profile_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profile_actions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_profile_actions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_profile_actions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_profile_actions_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







