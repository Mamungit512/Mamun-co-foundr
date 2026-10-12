-- Migration: Add admin_exports audit table
-- Every CSV of student data that a school admin downloads from the retention
-- screens is recorded here before the file is returned (FERPA: exports are
-- logged against the admin who made them). Written only by the service-role
-- client in src/features/school/services/retention/exports.ts.

CREATE TABLE IF NOT EXISTS "public"."admin_exports" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "organization_id" uuid NOT NULL REFERENCES "public"."organizations" ("id"),
  "admin_user_id" text NOT NULL,
  "admin_email" text NOT NULL,
  "kind" text NOT NULL,
  "row_count" integer NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "admin_exports_org_created_idx"
  ON "public"."admin_exports" ("organization_id", "created_at" DESC);

-- RLS on with no policies, and the baseline's default grants removed, so the
-- anon and authenticated keys can neither read nor write the audit log.
ALTER TABLE "public"."admin_exports" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "public"."admin_exports" FROM PUBLIC, anon, authenticated;
