import { getAppUrl } from "../client";
import { resolveOrgBranding } from "../branding";
import { sendTemplateEmail } from "../send";
import { hasEmailBeenSent, markEmailSent } from "../idempotency";

export type ProfileReminderResult = "sent" | "skipped" | "failed";

/**
 * Sends the "finish your profile" reminder to a user who signed up ~48h ago but
 * hasn't completed onboarding. Idempotent: a per-user flag in Clerk privateMetadata
 * guarantees it's only ever sent once.
 */
export async function sendProfileReminderEmail({
  userId,
  email,
  firstName,
  orgSlug,
}: {
  userId: string;
  email: string;
  firstName?: string | null;
  orgSlug?: string | null;
}): Promise<ProfileReminderResult> {
  try {
    const alreadySent = await hasEmailBeenSent(userId, "profileReminder");
    if (alreadySent) {
      console.log(
        `[email] profileReminder already sent for ${userId} — skipping`,
      );
      return "skipped";
    }

    const { primaryColor, wordmark } = resolveOrgBranding(orgSlug);
    const result = await sendTemplateEmail({
      type: "profileReminder",
      to: email,
      variables: {
        primaryColor,
        wordmark,
        firstName: firstName || "there",
        ctaUrl: `${getAppUrl()}/onboarding`,
      },
    });

    if (result.ok) {
      await markEmailSent(userId, "profileReminder");
      return "sent";
    }

    return "failed";
  } catch (err) {
    console.error(
      `[email] unexpected error in sendProfileReminderEmail for ${userId}:`,
      err,
    );
    return "failed";
  }
}
