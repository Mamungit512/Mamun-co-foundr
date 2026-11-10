import { resolveOrgBranding } from "../branding";
import { sendTemplateEmail } from "../send";
import { hasEmailBeenSent, markEmailSent } from "../idempotency";

export const UT_ORG_SLUG = "ut";
export const UT_ANNOUNCEMENT_CTA_URL = "https://ut.mamuncofoundr.com/";
// TODO: set to the live feedback form URL before the real send. The runner
// refuses to send while this is empty.
export const UT_ANNOUNCEMENT_FEEDBACK_URL = "";

export type UtAnnouncementResult = "sent" | "skipped" | "failed";

/**
 * Sends the UT feature announcement to one user. Idempotent: a per-user flag
 * in Clerk privateMetadata guarantees it is only ever sent once, and the flag
 * is written only after the send succeeds.
 */
export async function sendUtAnnouncementEmail({
  userId,
  email,
  firstName,
}: {
  userId: string;
  email: string;
  firstName?: string | null;
}): Promise<UtAnnouncementResult> {
  try {
    if (await hasEmailBeenSent(userId, "utAnnouncement")) {
      console.log(`[email] utAnnouncement already sent for ${userId} — skipping`);
      return "skipped";
    }

    const { primaryColor, wordmark } = resolveOrgBranding(UT_ORG_SLUG);
    const result = await sendTemplateEmail({
      type: "utAnnouncement",
      to: email,
      orgSlug: UT_ORG_SLUG,
      variables: {
        primaryColor,
        wordmark,
        firstName: firstName || "there",
        ctaUrl: UT_ANNOUNCEMENT_CTA_URL,
        feedbackUrl: UT_ANNOUNCEMENT_FEEDBACK_URL,
      },
    });

    if (result.ok) {
      await markEmailSent(userId, "utAnnouncement");
      return "sent";
    }
    return "failed";
  } catch (err) {
    console.error(
      `[email] unexpected error in sendUtAnnouncementEmail for ${userId}:`,
      err,
    );
    return "failed";
  }
}
