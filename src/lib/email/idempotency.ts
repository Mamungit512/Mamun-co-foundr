import { clerkClient } from "@clerk/nextjs/server";
import { EmailType } from "./catalog";

const FLAG_KEYS: Record<EmailType, string> = {
  welcome: "welcomeEmailSentAt",
  profileReminder: "profileReminderSentAt",
  reEngagement: "reEngagementSentAt",
  weeklyProfileViews: "weeklyProfileViewsSentAt",
  cofounderInvite: "cofounderInviteSentAt",
  cofounderLinked: "cofounderLinkedSentAt",
  utAnnouncement: "utAnnouncementSentAt",
  // These types use separate dedup mechanisms and are never routed through FLAG_KEYS.
  // meetup emails dedup on claim columns on the meetups row (see sendMeetupEmails).
  messageNotification: "lastEmailSent",
  mutualMatch: "weMatchNotifiedAt",
  meetupProposed: "meetupProposedEmailSentAt",
  meetupAccepted: "meetupAcceptedEmailSentAt",
  meetupDeclined: "meetupDeclinedEmailSentAt",
};

export async function hasEmailBeenSent(
  userId: string,
  type: EmailType,
): Promise<boolean> {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    return !!user.privateMetadata?.[FLAG_KEYS[type]];
  } catch (err) {
    console.error(
      `[email/idempotency] error checking ${type} for ${userId}:`,
      err,
    );
    // Fail closed: a duplicate welcome is worse than a missed one
    return true;
  }
}

export async function hasEmailBeenSentWithinDays(
  userId: string,
  type: EmailType,
  days: number,
): Promise<boolean> {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const sentAt = user.privateMetadata?.[FLAG_KEYS[type]];
    if (!sentAt) return false;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return new Date(sentAt as string).getTime() > cutoff;
  } catch (err) {
    console.error(
      `[email/idempotency] error checking ${type} within ${days}d for ${userId}:`,
      err,
    );
    return true;
  }
}

export async function markEmailSent(
  userId: string,
  type: EmailType,
): Promise<void> {
  try {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: {
        [FLAG_KEYS[type]]: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error(
      `[email/idempotency] error marking ${type} for ${userId}:`,
      err,
    );
  }
}

/**
 * Per-campaign dedup for repeatable sends (e.g. UT newsletters). Stored in
 * Clerk privateMetadata as `{ [mapKey]: { [campaignId]: sentAtIso } }`, so
 * each campaign reaches a user at most once while later campaigns still can.
 */
export function getCampaignSentAt(
  privateMetadata: Record<string, unknown> | null | undefined,
  mapKey: string,
  campaignId: string,
): string | null {
  const map = privateMetadata?.[mapKey];
  if (!map || typeof map !== "object") return null;
  const sentAt = (map as Record<string, unknown>)[campaignId];
  return typeof sentAt === "string" ? sentAt : null;
}

export async function hasCampaignBeenSent(
  userId: string,
  mapKey: string,
  campaignId: string,
): Promise<boolean> {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    return !!getCampaignSentAt(user.privateMetadata, mapKey, campaignId);
  } catch (err) {
    console.error(
      `[email/idempotency] error checking campaign ${campaignId} for ${userId}:`,
      err,
    );
    // Fail closed: a duplicate newsletter is worse than a missed one.
    return true;
  }
}

export async function markCampaignSent(
  userId: string,
  mapKey: string,
  campaignId: string,
): Promise<void> {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const existing = user.privateMetadata?.[mapKey];
    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: {
        [mapKey]: {
          ...(existing && typeof existing === "object" ? existing : {}),
          [campaignId]: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    console.error(
      `[email/idempotency] error marking campaign ${campaignId} for ${userId}:`,
      err,
    );
  }
}
