import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { getEmailDomain } from "@/features/school/auth/email-domain";
import { maskEmail, type SchoolAccount } from "./reconcile";

export const CLERK_CACHE_TAG = "clerk-accounts";
export const CLERK_CACHE_SECONDS = 6 * 60 * 60;

const PAGE = 500;
const ID_BATCH = 100;

// What is cached. Full emails are FERPA data and never stored in the cache;
// the hash lets staff be matched without them.
export type ClerkRecord = {
  id: string;
  createdAt: string;
  maskedEmail: string;
  emailHash: string | null;
  emailDomain: string | null;
  publicOrgId: string | null;
};

export type DomainFetch = { records: ClerkRecord[]; fetchedAt: string };

export function hashEmail(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export function primaryEmail(user: User): string | null {
  const primary =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0];
  return primary?.emailAddress?.toLowerCase() ?? null;
}

export function toRecord(user: User): ClerkRecord {
  const email = primaryEmail(user);
  const orgId = user.publicMetadata?.organization_id;
  return {
    id: user.id,
    createdAt: new Date(user.createdAt).toISOString(),
    maskedEmail: email ? maskEmail(email) : "(no email)",
    emailHash: email ? hashEmail(email) : null,
    emailDomain: email ? getEmailDomain(email) : null,
    publicOrgId: typeof orgId === "string" ? orgId : null,
  };
}

// "utexas.edu" already substring-matches "eid.utexas.edu", so searching the
// subdomains too would only repeat the same pages.
export function searchDomains(domains: string[]): string[] {
  const clean = [...new Set(domains.map((d) => d.trim().toLowerCase()))];
  return clean.filter(
    (d) => !clean.some((other) => other !== d && d.endsWith(`.${other}`)),
  );
}

// Clerk's `query` is a substring match over emails, names and usernames, so it
// over-fetches. This is the exact rule: an allowed domain or an org claim.
export function belongsToOrg(
  record: ClerkRecord,
  orgId: string,
  allowedDomains: string[],
): boolean {
  if (record.publicOrgId === orgId) return true;
  if (!record.emailDomain) return false;
  return allowedDomains.some(
    (d) => d.trim().toLowerCase() === record.emailDomain,
  );
}

async function pageAll(
  params: Parameters<Awaited<ReturnType<typeof clerkClient>>["users"]["getUserList"]>[0],
): Promise<User[]> {
  const client = await clerkClient();
  const users: User[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, totalCount } = await client.users.getUserList({
      ...params,
      limit: PAGE,
      offset,
      orderBy: "+created_at", // stable offsets if someone signs up mid-run
    });
    users.push(...data);
    if (offset + PAGE >= totalCount || data.length === 0) break;
  }
  return users;
}

async function fetchDomainRecords(
  orgId: string,
  allowedDomains: string[],
): Promise<DomainFetch> {
  const byId = new Map<string, ClerkRecord>();
  // Any failed page throws, so a partial list is never returned or cached.
  for (const domain of searchDomains(allowedDomains)) {
    for (const user of await pageAll({ query: domain })) {
      const record = toRecord(user);
      if (belongsToOrg(record, orgId, allowedDomains)) {
        byId.set(record.id, record);
      }
    }
  }
  return { records: [...byId.values()], fetchedAt: new Date().toISOString() };
}

export const getDomainRecords = (orgId: string, allowedDomains: string[]) =>
  unstable_cache(
    () => fetchDomainRecords(orgId, allowedDomains),
    ["retention-clerk", orgId, [...allowedDomains].sort().join(",")],
    { tags: [CLERK_CACHE_TAG], revalidate: CLERK_CACHE_SECONDS },
  )();

// Completed profiles whose owner was not found by domain (attribution rule 1:
// a school profile attributes the account). Whoever Clerk cannot find is an
// orphan. Small and uncached, since profiles change on every onboarding.
export async function fetchProfileOwners(ids: string[]): Promise<ClerkRecord[]> {
  if (ids.length === 0) return [];
  const client = await clerkClient();
  const found: ClerkRecord[] = [];
  for (let i = 0; i < ids.length; i += ID_BATCH) {
    const { data } = await client.users.getUserList({
      userId: ids.slice(i, i + ID_BATCH),
      limit: ID_BATCH,
    });
    found.push(...data.map(toRecord));
  }
  return found;
}

export function toAccounts(
  records: ClerkRecord[],
  staffHashes: Set<string>,
): SchoolAccount[] {
  return records.map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    maskedEmail: r.maskedEmail,
    isStaff: r.emailHash !== null && staffHashes.has(r.emailHash),
  }));
}

// Full emails, live. Used only by the ghost CSV export.
export async function fetchEmailsById(
  ids: string[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const client = await clerkClient();
  for (let i = 0; i < ids.length; i += ID_BATCH) {
    const { data } = await client.users.getUserList({
      userId: ids.slice(i, i + ID_BATCH),
      limit: ID_BATCH,
    });
    for (const u of data) {
      const email = primaryEmail(u);
      if (email) out.set(u.id, email);
    }
  }
  return out;
}
