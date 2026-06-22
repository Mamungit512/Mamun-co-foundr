import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { sendReEngagementEmail } from "../emails/reEngagement";
import type { LifecycleResult } from "./index";

// Users inactive at least this long are eligible for re-engagement.
const INACTIVE_DAYS = 14;
const PAGE_SIZE = 100;

/**
 * Finds users who haven't been active in 14+ days (Clerk `lastActiveAt`) and
 * sends each one a single re-engagement email (idempotent).
 *
 * Users with no `lastActiveAt` (never had session activity) are skipped — this
 * targets lapsed users, not never-activated signups.
 */
export async function runReEngagementReminders(): Promise<LifecycleResult> {
  const cutoff = Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000;

  const clerk = await clerkClient();

  type Candidate = {
    userId: string;
    email: string;
    firstName: string | null;
    organizationId: string | null;
  };

  const candidates: Candidate[] = [];
  let offset = 0;
  let reachedActive = false;

  // Page ascending by last_active_at — most-stale users first — so we can stop
  // as soon as we hit a user who's still active inside the window.
  while (!reachedActive) {
    const { data: users } = await clerk.users.getUserList({
      orderBy: "+last_active_at",
      limit: PAGE_SIZE,
      offset,
    });

    if (users.length === 0) break;

    for (const user of users) {
      // Never active → skip (lapsed-only). Defensive regardless of null sort order.
      if (user.lastActiveAt == null) continue;
      // Ascending order: once we reach an active user, everyone after is active.
      if (user.lastActiveAt >= cutoff) {
        reachedActive = true;
        break;
      }
      if (user.privateMetadata?.reEngagementSentAt) continue;

      const email =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
          ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      candidates.push({
        userId: user.id,
        email,
        firstName: user.firstName ?? null,
        organizationId:
          (user.publicMetadata?.organization_id as string | undefined) ?? null,
      });
    }

    if (users.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  // Batch-resolve org slugs for school-branded emails.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const orgIds = [
    ...new Set(
      candidates.map((c) => c.organizationId).filter((id): id is string => !!id),
    ),
  ];
  const orgSlugById = new Map<string, string>();
  if (orgIds.length > 0) {
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, slug")
      .in("id", orgIds);
    for (const org of orgs ?? []) {
      if (org.slug) orgSlugById.set(org.id, org.slug);
    }
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const c of candidates) {
    const result = await sendReEngagementEmail({
      userId: c.userId,
      email: c.email,
      firstName: c.firstName,
      orgSlug: c.organizationId ? (orgSlugById.get(c.organizationId) ?? null) : null,
    });
    if (result === "sent") sent++;
    else if (result === "skipped") skipped++;
    else failed++;
  }

  return {
    name: "reEngagement",
    candidates: candidates.length,
    sent,
    skipped,
    failed,
  };
}
