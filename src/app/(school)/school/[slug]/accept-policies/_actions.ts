"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getRequiredConsents } from "@/features/legal/consent";
import { getOrganizationBySlug } from "@/features/school/data/organizations";

type RecordConsentResult = { ok: true } | { ok: false; error: string };

/**
 * Persist that the current user accepted all required policy documents for `slug`.
 * Identity comes from the server session — never from client input. Versions are
 * derived server-side from the org config, not trusted from the caller.
 */
export async function recordPolicyConsents(
  slug: string,
): Promise<RecordConsentResult> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return { ok: false, error: "No logged-in user." };
  }

  // Prefer the session claim, but fall back to resolving the org from the slug.
  // A just-signed-in user (e.g. an invited co-founder) can hit this action before
  // Clerk's organization_id metadata has propagated onto their JWT — the slug is
  // authoritative for which school's policies are being accepted, so it is both a
  // safe and more robust source of org context.
  const organizationId =
    sessionClaims?.metadata?.organization_id ??
    (await getOrganizationBySlug(slug))?.id ??
    null;
  if (!organizationId) {
    return { ok: false, error: "No organization context for this user." };
  }

  const required = getRequiredConsents(slug);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Append-only: insert a new row for each required document. Middleware reads
  // the latest accepted_at per document. organization_id is snapshotted from the
  // session claim so each record stays self-contained after any org changes.
  const rows = required.map((c) => ({
    user_id: userId,
    organization_id: organizationId,
    document: c.document,
    version: c.version,
  }));

  const { error } = await supabase.from("user_consents").insert(rows);

  if (error) {
    console.error("Error recording policy consents:", error);
    return { ok: false, error: "Could not save your acceptance. Please try again." };
  }

  return { ok: true };
}
