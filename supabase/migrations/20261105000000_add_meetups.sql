-- Migration: Add meetups + meetup_locations
-- Two new tables for "Propose a meetup" (MCFM-183). Nothing existing is altered.
--
-- meetup_locations: the school's approved campus spots, managed by the school
--   admin. Rows are never deleted; is_active=false hides a spot from new
--   proposals while past meetups keep resolving it.
-- meetups: one proposal between two students in a mutual match. Statuses are
--   only proposed / accepted / declined. There is deliberately no decline
--   reason column.
--
-- Written only by the service-role client in API routes (the same server-only
-- pattern as admin_exports): RLS on with no policies, grants removed.
--
-- Times are stored in UTC and rendered/validated in America/Chicago by the app.
-- The note is only ever shown to the other student; it is never exposed to
-- admin views.
--
-- The *_email_sent_at columns are claimed (set) BEFORE calling Resend so an
-- email can never be sent twice. NULL means "not sent yet".

CREATE TABLE IF NOT EXISTS "public"."meetup_locations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "organization_id" uuid NOT NULL REFERENCES "public"."organizations" ("id"),
  "name" text NOT NULL,
  "building" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "meetup_locations_name_check"
    CHECK (char_length(btrim("name")) BETWEEN 1 AND 120),
  CONSTRAINT "meetup_locations_building_check"
    CHECK ("building" IS NULL OR char_length("building") <= 160),
  -- Target for the composite FK from meetups so a meetup can only reference a
  -- location belonging to its own school.
  CONSTRAINT "meetup_locations_id_org_key" UNIQUE ("id", "organization_id")
);

CREATE INDEX IF NOT EXISTS "meetup_locations_org_idx"
  ON "public"."meetup_locations" ("organization_id");

CREATE TABLE IF NOT EXISTS "public"."meetups" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "organization_id" uuid NOT NULL REFERENCES "public"."organizations" ("id"),
  "proposer_user_id" text NOT NULL
    REFERENCES "public"."profiles" ("user_id") ON DELETE CASCADE,
  "recipient_user_id" text NOT NULL
    REFERENCES "public"."profiles" ("user_id") ON DELETE CASCADE,
  -- Order-independent key for the pair, so "one open proposal per pair" holds
  -- no matter who proposed.
  "pair_key" text GENERATED ALWAYS AS (
    LEAST("proposer_user_id", "recipient_user_id")
    || ':' ||
    GREATEST("proposer_user_id", "recipient_user_id")
  ) STORED,
  "location_id" uuid NOT NULL,
  "starts_at" timestamptz NOT NULL,
  "note" text,
  "status" text NOT NULL DEFAULT 'proposed',
  "responded_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "proposed_email_sent_at" timestamptz,
  "accepted_proposer_email_sent_at" timestamptz,
  "accepted_recipient_email_sent_at" timestamptz,
  "declined_email_sent_at" timestamptz,
  CONSTRAINT "meetups_status_check"
    CHECK ("status" IN ('proposed', 'accepted', 'declined')),
  CONSTRAINT "meetups_note_check"
    CHECK ("note" IS NULL OR char_length("note") <= 280),
  CONSTRAINT "meetups_no_self_pair_check"
    CHECK ("proposer_user_id" <> "recipient_user_id"),
  CONSTRAINT "meetups_location_same_org_fkey"
    FOREIGN KEY ("location_id", "organization_id")
    REFERENCES "public"."meetup_locations" ("id", "organization_id")
);

-- At most one open (proposed) meetup per pair.
CREATE UNIQUE INDEX IF NOT EXISTS "meetups_one_open_per_pair_idx"
  ON "public"."meetups" ("pair_key") WHERE "status" = 'proposed';

CREATE INDEX IF NOT EXISTS "meetups_pair_created_idx"
  ON "public"."meetups" ("pair_key", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "meetups_org_created_idx"
  ON "public"."meetups" ("organization_id", "created_at" DESC);

-- RLS on with no policies, and the baseline's default grants removed, so the
-- anon and authenticated keys can neither read nor write these tables. All
-- access goes through service-role API routes that check pair membership.
ALTER TABLE "public"."meetup_locations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "public"."meetup_locations" FROM PUBLIC, anon, authenticated;

ALTER TABLE "public"."meetups" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "public"."meetups" FROM PUBLIC, anon, authenticated;
