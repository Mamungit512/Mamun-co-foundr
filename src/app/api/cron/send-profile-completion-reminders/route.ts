import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { sendProfileReminderEmail } from "@/lib/email";

/**
 * Daily cron: nudge users who signed up ~48h ago but haven't completed onboarding.
 *
 * Source of truth is Clerk, not Supabase — a `profiles` row is only created when a
 * user *submits* onboarding, so users who never onboarded have no Supabase row.
 *
 * Eligibility (evaluated fresh each run):
 *   - publicMetadata.onboardingComplete !== true
 *   - signed up between MIN_AGE_HOURS and MAX_AGE_DAYS ago
 *   - privateMetadata.profileReminderSentAt not set (idempotency)
 *
 * The MAX_AGE_DAYS ceiling is a backlog guard so the first run doesn't blast every
 * stale never-onboarded account.
 *
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-profile-completion-reminders",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 */

const MIN_AGE_HOURS = 48;
const MAX_AGE_DAYS = 7;
const PAGE_SIZE = 100;

type Candidate = {
  userId: string;
  email: string;
  firstName: string | null;
  organizationId: string | null;
};

export async function GET(req: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or contains the correct auth header
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid cron secret" },
        { status: 401 },
      );
    }

    const now = Date.now();
    const newestEligible = now - MIN_AGE_HOURS * 60 * 60 * 1000; // createdAt must be <= this (>= 48h old)
    const oldestEligible = now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000; // createdAt must be >= this (<= 7d old)

    const clerk = await clerkClient();

    // Page through users newest-first, pre-filtering on already-loaded fields.
    // Because results are ordered by -created_at, we can stop as soon as we pass
    // the old edge of the window — no need to scan the entire user base.
    const candidates: Candidate[] = [];
    let offset = 0;
    let reachedWindowEnd = false;

    while (!reachedWindowEnd) {
      const { data: users } = await clerk.users.getUserList({
        orderBy: "-created_at",
        limit: PAGE_SIZE,
        offset,
      });

      if (users.length === 0) break;

      for (const user of users) {
        // Older than the window — since users are newest-first, we're done.
        if (user.createdAt < oldestEligible) {
          reachedWindowEnd = true;
          break;
        }

        // Too new (< 48h) — skip, but keep scanning toward older users.
        if (user.createdAt > newestEligible) continue;

        // Already finished onboarding.
        if (user.publicMetadata?.onboardingComplete === true) continue;

        // Already reminded (idempotency) — cheap check from the loaded user object.
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
            (user.publicMetadata?.organization_id as string | undefined) ??
            null,
        });
      }

      if (users.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    // Batch-resolve org slugs for school users so the reminder carries their branding
    // (mirrors how the welcome email resolves branding from the webhook's org lookup).
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

    console.log(
      `✅ Profile reminder cron: ${sent} sent, ${skipped} skipped, ${failed} failed (${candidates.length} candidates)`,
    );

    return NextResponse.json({
      success: true,
      candidates: candidates.length,
      sent,
      skipped,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Profile reminder cron error:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Allow POST as well for manual triggering
export async function POST(req: NextRequest) {
  return GET(req);
}
