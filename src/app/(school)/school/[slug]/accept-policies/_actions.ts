"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getRequiredPrivacyPolicyVersion } from "@/features/legal/consent";

type RecordConsentResult = { ok: true; version: string } | { ok: false; error: string };

/**
 * Persist that the current user accepted the privacy policy in force for `slug`.
 * Identity comes from the server session — never from client input. The version is
 * derived server-side from the org config, not trusted from the caller.
 */
export async function recordPrivacyPolicyConsent(
  slug: string,
): Promise<RecordConsentResult> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return { ok: false, error: "No logged-in user." };
  }

  const organizationId = sessionClaims?.metadata?.organization_id ?? null;
  if (!organizationId) {
    return { ok: false, error: "No organization context for this user." };
  }

  const version = getRequiredPrivacyPolicyVersion(slug);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Append-only: insert a new row for each acceptance. Middleware reads the latest
  // by accepted_at. organization_id is snapshotted from the session claim so the
  // record stays self-contained after any org changes.
  const { error } = await supabase.from("user_consents").insert({
    user_id: userId,
    organization_id: organizationId,
    document: "privacy_policy",
    version,
  });

  if (error) {
    console.error("Error recording privacy-policy consent:", error);
    return { ok: false, error: "Could not save your acceptance. Please try again." };
  }

  return { ok: true, version };
}
