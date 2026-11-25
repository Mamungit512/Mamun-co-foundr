import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getEmailDomain } from "@/features/school/auth/email-domain";

/**
 * Links Clerk users to their school organization by email domain.
 *
 * Used by the Clerk `user.created` webhook (new signups) and by the nightly
 * lifecycle cron (existing users who signed up before their domain was
 * allow-listed, or whose webhook failed). Both go through
 * `resolveOrgForEmail` + `assignUserToOrg`, so the rules live in one place:
 * a user is linked only when their email domain is in the org's
 * `allowed_email_domains` AND the org has signed the FERPA DPA.
 */

export type LinkableOrg = {
  id: string;
  slug: string;
  ferpa_dpa_signed_at: string | null;
  allowed_email_domains: string[] | null;
};

export type OrgResolution =
  /** Domain matches an org with a signed DPA: link the user. */
  | { status: "assign"; domain: string; org: LinkableOrg }
  /** Domain matches an org that has not signed the DPA yet: do not link. */
  | { status: "unsigned"; domain: string; org: LinkableOrg }
  /** No org allows this domain (or the email has no domain). */
  | { status: "none"; domain: string | null; org: null };

const ORG_COLUMNS = "id, slug, ferpa_dpa_signed_at, allowed_email_domains";

function serviceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/** Orgs whose allow-list contains `domain`. */
export async function fetchOrgsForDomain(
  domain: string,
): Promise<LinkableOrg[]> {
  const { data } = await serviceSupabase()
    .from("organizations")
    .select(ORG_COLUMNS)
    .contains("allowed_email_domains", [domain]);
  return (data as LinkableOrg[] | null) ?? [];
}

/** Every org that has at least one allowed email domain. */
export async function fetchOrgsWithDomains(): Promise<LinkableOrg[]> {
  const { data } = await serviceSupabase()
    .from("organizations")
    .select(ORG_COLUMNS)
    .not("allowed_email_domains", "is", null);
  return ((data as LinkableOrg[] | null) ?? []).filter(
    (o) => (o.allowed_email_domains ?? []).length > 0,
  );
}

/** Pure: decide which org (if any) an email belongs to. */
export function resolveOrgForEmail(
  email: string,
  orgs: LinkableOrg[],
): OrgResolution {
  const domain = getEmailDomain(email);
  if (!domain) return { status: "none", domain: null, org: null };

  const matches = orgs.filter((o) =>
    (o.allowed_email_domains ?? []).some(
      (d) => d.trim().toLowerCase() === domain,
    ),
  );
  const signed = matches.find((o) => !!o.ferpa_dpa_signed_at);
  if (signed) return { status: "assign", domain, org: signed };
  if (matches[0]) return { status: "unsigned", domain, org: matches[0] };
  return { status: "none", domain, org: null };
}

export async function assignUserToOrg(
  userId: string,
  orgId: string,
): Promise<void> {
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { organization_id: orgId },
  });
}

export type OrgBackfillResult = {
  scanned: number;
  alreadyLinked: number;
  linked: number;
  failed: number;
  unsignedOrg: number;
  noMatch: number;
  /** UT-looking domains (contain "utexas.edu") that matched no org. */
  unmatchedUtDomains: string[];
};

const PAGE_SIZE = 100;

/**
 * Nightly backfill: link every Clerk user without `organization_id` whose
 * primary email domain belongs to a DPA-signed org. Idempotent — users that
 * already have an org are never touched. Logs counts and domains only.
 */
export async function backfillUserOrganizations(): Promise<OrgBackfillResult> {
  const orgs = await fetchOrgsWithDomains();
  const clerk = await clerkClient();

  const result: OrgBackfillResult = {
    scanned: 0,
    alreadyLinked: 0,
    linked: 0,
    failed: 0,
    unsignedOrg: 0,
    noMatch: 0,
    unmatchedUtDomains: [],
  };
  const unmatchedUt = new Set<string>();

  let offset = 0;
  while (true) {
    const { data: users } = await clerk.users.getUserList({
      orderBy: "+created_at",
      limit: PAGE_SIZE,
      offset,
    });
    if (users.length === 0) break;

    for (const user of users) {
      result.scanned++;
      if (user.publicMetadata?.organization_id) {
        result.alreadyLinked++;
        continue;
      }

      const email =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
          ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
      const resolution = email
        ? resolveOrgForEmail(email, orgs)
        : ({ status: "none", domain: null, org: null } as const);

      if (resolution.status === "assign") {
        try {
          await assignUserToOrg(user.id, resolution.org.id);
          result.linked++;
        } catch (err) {
          result.failed++;
          console.error(
            "[org-backfill] failed to assign org:",
            err instanceof Error ? err.message : "unknown error",
          );
        }
      } else if (resolution.status === "unsigned") {
        result.unsignedOrg++;
      } else {
        result.noMatch++;
        if (resolution.domain?.includes("utexas.edu")) {
          unmatchedUt.add(resolution.domain);
        }
      }
    }

    if (users.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  result.unmatchedUtDomains = [...unmatchedUt].sort();

  console.log(
    `[org-backfill] scanned=${result.scanned} alreadyLinked=${result.alreadyLinked} linked=${result.linked} failed=${result.failed} unsignedOrg=${result.unsignedOrg} noMatch=${result.noMatch}`,
  );
  if (result.unmatchedUtDomains.length > 0) {
    console.warn(
      `[org-backfill] UT-looking domains with no org (add to allowed_email_domains?): ${result.unmatchedUtDomains.join(", ")}`,
    );
  }

  return result;
}
