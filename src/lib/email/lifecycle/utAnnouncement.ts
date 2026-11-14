import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendUtAnnouncementEmail,
  UT_ORG_SLUG,
} from "../emails/utAnnouncement";
import type { LifecycleResult } from "./index";

const PAGE_SIZE = 100;
// Resend's default limit is 2 requests per second.
const SEND_DELAY_MS = 550;
const SAMPLE_SIZE = 10;

export type UtAnnouncementOptions = {
  /** When true (the default) nothing is sent and no flags are written. */
  dryRun?: boolean;
  /** Max emails to send in this invocation; re-run to continue. */
  limit?: number;
  /** Only users inactive this many days or more (or never active). */
  inactiveDays?: number;
};

export type UtAnnouncementResult = LifecycleResult & {
  dryRun: boolean;
  /** Eligible users not processed in this run (because of `limit`). */
  remaining: number;
  /** Masked emails of the first few eligible users. */
  sample: string[];
};

type Candidate = {
  userId: string;
  email: string;
  firstName: string | null;
};

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}***@${domain ?? ""}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Sends the UT feature announcement to every UT user who has not received it.
 * Manually triggered (not on a cron). Safe to re-run: users already flagged
 * are skipped.
 */
export async function runUtAnnouncement(
  options: UtAnnouncementOptions = {},
): Promise<UtAnnouncementResult> {
  const { dryRun = true, limit = 50, inactiveDays } = options;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", UT_ORG_SLUG)
    .single();
  if (!org?.id) {
    throw new Error("UT organization not found");
  }

  const cutoff =
    inactiveDays !== undefined
      ? Date.now() - inactiveDays * 24 * 60 * 60 * 1000
      : null;

  const clerk = await clerkClient();
  const candidates: Candidate[] = [];
  let offset = 0;

  while (true) {
    const { data: users } = await clerk.users.getUserList({
      orderBy: "+created_at",
      limit: PAGE_SIZE,
      offset,
    });
    if (users.length === 0) break;

    for (const user of users) {
      if (user.publicMetadata?.organization_id !== org.id) continue;
      if (user.privateMetadata?.utAnnouncementSentAt) continue;
      if (
        cutoff !== null &&
        user.lastActiveAt != null &&
        user.lastActiveAt >= cutoff
      ) {
        continue;
      }
      const email =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
          ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      candidates.push({
        userId: user.id,
        email,
        firstName: user.firstName ?? null,
      });
    }

    if (users.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  const batch = candidates.slice(0, Math.max(0, limit));
  const base = {
    name: "utAnnouncement",
    candidates: candidates.length,
    dryRun,
    sample: candidates.slice(0, SAMPLE_SIZE).map((c) => maskEmail(c.email)),
  };

  if (dryRun) {
    return {
      ...base,
      sent: 0,
      skipped: 0,
      failed: 0,
      remaining: candidates.length,
    };
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const [i, c] of batch.entries()) {
    const result = await sendUtAnnouncementEmail({
      userId: c.userId,
      email: c.email,
      firstName: c.firstName,
    });
    if (result === "sent") sent++;
    else if (result === "skipped") skipped++;
    else failed++;
    if (i < batch.length - 1) await sleep(SEND_DELAY_MS);
  }

  return {
    ...base,
    sent,
    skipped,
    failed,
    remaining: candidates.length - batch.length,
  };
}
