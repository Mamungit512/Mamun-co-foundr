import { clerkClient } from "@clerk/nextjs/server";
import { EmailType } from "./catalog";

const FLAG_KEYS: Record<EmailType, string> = {
  welcome: "welcomeEmailSentAt",
  profileReminder: "profileReminderSentAt",
  reEngagement: "reEngagementSentAt",
  weeklyProfileViews: "weeklyProfileViewsSentAt",
  cofounderInvite: "cofounderInviteSentAt",
  cofounderLinked: "cofounderLinkedSentAt",
  // These two types use separate dedup mechanisms and are never routed through FLAG_KEYS.
  messageNotification: "lastEmailSent",
  mutualMatch: "weMatchNotifiedAt",
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
