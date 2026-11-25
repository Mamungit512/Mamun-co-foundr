import { getAppUrl } from "../client";
import { resolveOrgBranding } from "../branding";
import { sendTemplateEmail } from "../send";
import { hasEmailBeenSentWithinDays, markEmailSent } from "../idempotency";

export type WeeklyProfileViewsResult = "sent" | "skipped" | "failed";

const RESEND_DAYS = 6;

export async function sendWeeklyProfileViewsEmail({
  userId,
  email,
  firstName,
  viewCount,
  orgSlug,
}: {
  userId: string;
  email: string;
  firstName?: string | null;
  viewCount: number;
  orgSlug?: string | null;
}): Promise<WeeklyProfileViewsResult> {
  try {
    // UT-only for now: the general (non-school) templates were deleted from
    // Resend, so sending without an org would 404. Not marked as sent, so the
    // user gets the school email once they are linked to their org.
    if (!orgSlug) {
      console.log(`[email] weeklyProfileViews skipped: no org (${userId})`);
      return "skipped";
    }

    const alreadySent = await hasEmailBeenSentWithinDays(
      userId,
      "weeklyProfileViews",
      RESEND_DAYS,
    );
    if (alreadySent) {
      console.log(
        `[email] weeklyProfileViews already sent within ${RESEND_DAYS}d for ${userId} — skipping`,
      );
      return "skipped";
    }

    const { primaryColor, wordmark } = resolveOrgBranding(orgSlug);
    const ctaUrl = orgSlug
      ? `${getAppUrl()}/school/${orgSlug}/dashboard`
      : `${getAppUrl()}/cofoundr-matching`;

    const result = await sendTemplateEmail({
      type: "weeklyProfileViews",
      to: email,
      orgSlug,
      variables: {
        primaryColor,
        wordmark,
        firstName: firstName || "there",
        viewCount,
        ctaUrl,
      },
    });

    if (result.ok) {
      await markEmailSent(userId, "weeklyProfileViews");
      return "sent";
    }

    return "failed";
  } catch (err) {
    console.error(
      `[email] unexpected error in sendWeeklyProfileViewsEmail for ${userId}:`,
      err,
    );
    return "failed";
  }
}
