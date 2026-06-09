import { getOrganizationBySlug } from "@/features/school/data/organizations";
import { getVerifiedPrimaryEmail } from "@/features/school/auth/org-admin";

const STAFF_EMAIL_DOMAIN = "@mamuncofoundr.com";

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
 *    must be a member of that org, or be Mamun staff (page tenant always wins,
 *    so staff see the school's pool here — never the general pool).
 *  - On the apex page (no slug): general users and Mamun staff see the general
 *    pool. A school user hitting the slug-less endpoint is scoped to their own
 *    org defensively (middleware normally redirects them to their portal).
 */
export async function resolveTenantScope({
  userId,
  sessionOrgId,
  slug,
}: {
  userId: string;
  sessionOrgId: string | null;
  slug: string | null;
}): Promise<TenantScope> {
  if (slug) {
    const org = await getOrganizationBySlug(slug);
    if (!org) return { kind: "denied" };

    if (sessionOrgId === org.id) return { kind: "org", orgId: org.id };
    if (await isMamunStaff(userId)) return { kind: "org", orgId: org.id };

    return { kind: "denied" };
  }

  if (!sessionOrgId) return { kind: "general" };
  if (await isMamunStaff(userId)) return { kind: "general" };

  return { kind: "org", orgId: sessionOrgId };
}
