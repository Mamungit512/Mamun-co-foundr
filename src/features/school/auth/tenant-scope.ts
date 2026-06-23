import { createClient } from "@supabase/supabase-js";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import { getVerifiedPrimaryEmail } from "@/features/school/auth/org-admin";

const STAFF_EMAIL_DOMAIN = "@mamuncofoundr.com";

function serviceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Which matching pool a request is allowed to read.
 *  - `general` → the main pool (profiles where organization_id IS NULL)
 *  - `org`     → a single school tenant's pool (organization_id = orgId)
 *  - `denied`  → the viewer may not see the requested tenant; return empty
 */
export type TenantScope =
  | { kind: "denied" }
  | { kind: "general" }
  | { kind: "org"; orgId: string };

export async function isMamunStaff(userId: string): Promise<boolean> {
  const email = await getVerifiedPrimaryEmail(userId);
  return !!email?.endsWith(STAFF_EMAIL_DOMAIN);
}

/**
 * Resolve which pool a matching/search request may read, anchored to the
 * tenant of the *page* (the `org` slug) rather than the HTTP host.
 *
 * The slug is untrusted input from the client; membership is validated
 * server-side, so a forged or mismatched slug resolves to `denied` and the
 * caller returns empty results — never another tenant's (or the main) data.
 *
 * Rules:
 *  - On a school page (slug present): the pool is that school's. The viewer
 *    must be a member of that org (sessionOrgId matches), or be Mamun staff.
 *  - On the apex page (no slug): always the general pool, regardless of the
 *    user's organization_id. Experience is request-derived.
 */
export async function resolveTenantScope({
  userId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sessionOrgId: _sessionOrgId,
  slug,
}: {
  userId: string;
  /** @deprecated Kept for call-site compatibility; membership table is authoritative now. */
  sessionOrgId: string | null;
  slug: string | null;
}): Promise<TenantScope> {
  if (slug) {
    const org = await getOrganizationBySlug(slug);
    if (!org) return { kind: "denied" };

    // Check membership table (authoritative after Design A).
    // The old sessionOrgId === org.id check is replaced because a dual-pool
    // user's single JWT claim may not match the page's org even though they
    // are a valid member.
    const { data: membership } = await serviceRoleClient()
      .from("profile_pool_memberships")
      .select("user_id")
      .eq("user_id", userId)
      .eq("organization_id", org.id)
      .maybeSingle();

    if (membership) return { kind: "org", orgId: org.id };
    if (await isMamunStaff(userId)) return { kind: "org", orgId: org.id };

    return { kind: "denied" };
  }

  // On the apex/main site (no slug), always resolve to the general pool regardless
  // of the user's organization_id. The experience is request-derived: the absence
  // of a slug means the user is in a general context. (Phase 1 accepted limitation:
  // a school-onboarded user's profiles row may still carry an organization_id, so
  // they won't appear in general matching until Phase 2 re-keys the profiles table.)
  return { kind: "general" };
}
