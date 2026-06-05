import { getAppUrl } from "../client";
import { resolveOrgBranding } from "../branding";
import { sendTemplateEmail } from "../send";
import { hasEmailBeenSent, markEmailSent } from "../idempotency";

export async function sendWelcomeEmail({
  userId,
  email,
  orgSlug,
}: {
  userId: string;
  email: string;
  orgSlug?: string | null;
}): Promise<void> {
  try {
    const alreadySent = await hasEmailBeenSent(userId, "welcome");
    if (alreadySent) {
      console.log(`[email] welcome already sent for ${userId} — skipping`);
      return;
    }

    const { primaryColor, wordmark } = resolveOrgBranding(orgSlug);
    const result = await sendTemplateEmail({
      type: "welcome",
      to: email,
      variables: {
        primaryColor,
        wordmark,
        ctaUrl: `${getAppUrl()}/onboarding`,
      },
    });

    if (result.ok) {
      await markEmailSent(userId, "welcome");
    }
  } catch (err) {
    console.error(
      `[email] unexpected error in sendWelcomeEmail for ${userId}:`,
      err,
    );
  }
}
