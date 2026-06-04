import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { sendProfileReminderEmail } from "../emails/profileReminder";
import type { LifecycleResult } from "./index";

// Users must be at least this old to receive the reminder
const MIN_AGE_HOURS = 48;
// Backlog guard: don't reach back further than this on first deploy
const MAX_AGE_DAYS = 7;
const PAGE_SIZE = 100;

/**
 * Finds users who signed up 48h–7d ago and never completed onboarding,
 * sends each one a single profile completion reminder (idempotent).
 */
export async function runProfileCompletionReminders(): Promise<LifecycleResult> {
  const now = Date.now();
  const newestEligible = now - MIN_AGE_HOURS * 60 * 60 * 1000;
  const oldestEligible = now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  const clerk = await clerkClient();

  type Candidate = {
    userId: string;
    email: string;
    firstName: string | null;
    organizationId: string | null;
  };

  const candidates: Candidate[] = [];
  let offset = 0;
  let reachedWindowEnd = false;

  // Page newest-first; stop once we pass the old edge of the window.
  while (!reachedWindowEnd) {
    const { data: users } = await clerk.users.getUserList({
      orderBy: "-created_at",
      limit: PAGE_SIZE,
      offset,
    });

    if (users.length === 0) break;

    for (const user of users) {
      if (user.createdAt < oldestEligible) {
        reachedWindowEnd = true;
        break;
      }
      if (user.createdAt > newestEligible) continue;
      if (user.publicMetadata?.onboardingComplete === true) continue;
      if (user.privateMetadata?.profileReminderSentAt) continue;

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

  // Batch-resolve org slugs for school-branded emails
  const orgIds = [
    ...new Set(
      candidates
        .map((c) => c.organizationId)
        .filter((id): id is string => !!id),
    ),
  ];
  const orgSlugById = new Map<string, string>();
  if (orgIds.length > 0) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
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
    const result = await sendProfileReminderEmail({
      userId: c.userId,
      email: c.email,
      firstName: c.firstName,
      orgSlug: c.organizationId
        ? (orgSlugById.get(c.organizationId) ?? null)
        : null,
    });
    if (result === "sent") sent++;
    else if (result === "skipped") skipped++;
    else failed++;
  }

  return { name: "profileCompletionReminder", candidates: candidates.length, sent, skipped, failed };
}
