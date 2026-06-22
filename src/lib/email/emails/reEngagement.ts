import { sendTemplateEmail } from "../send";
import { hasEmailBeenSent, markEmailSent } from "../idempotency";

export type ReEngagementResult = "sent" | "skipped" | "failed";

/**
 * Sends the re-engagement ("we miss you") email to a user who hasn't been active
 * in ~14 days. Idempotent: a per-user flag in Clerk privateMetadata guarantees
 * it's only ever sent once.
 */
export async function sendReEngagementEmail({
  userId,
  email,
  firstName,
  orgSlug,
}: {
  userId: string;
  email: string;
  firstName?: string | null;
  orgSlug?: string | null;
}): Promise<ReEngagementResult> {
  try {
    const alreadySent = await hasEmailBeenSent(userId, "reEngagement");
    if (alreadySent) {
      console.log(
        `[email] reEngagement already sent for ${userId} — skipping`,
      );
      return "skipped";
    }

    const result = await sendTemplateEmail({
      type: "reEngagement",
      to: email,
      orgSlug,
      variables: {
        firstName: firstName || "there",
      },
    });

    if (result.ok) {
      await markEmailSent(userId, "reEngagement");
      return "sent";
    }

    return "failed";
  } catch (err) {
    console.error(
      `[email] unexpected error in sendReEngagementEmail for ${userId}:`,
      err,
    );
    return "failed";
  }
}
