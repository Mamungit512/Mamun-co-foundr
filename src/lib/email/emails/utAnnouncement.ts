import { sendTemplateEmail } from "../send";
import { hasCampaignBeenSent, markCampaignSent } from "../idempotency";

export const UT_ORG_SLUG = "ut";

/** Clerk privateMetadata key holding `{ [campaignId]: sentAtIso }`. */
export const UT_ANNOUNCEMENT_CAMPAIGNS_KEY = "utAnnouncementCampaigns";

export type UtAnnouncementResult = "sent" | "skipped" | "failed";

/**
 * Sends one UT newsletter campaign to one user. Idempotent per campaign: a
 * per-user, per-campaign flag in Clerk privateMetadata guarantees each
 * campaign is sent at most once, and the flag is written only after the send
 * succeeds. A new campaign id can be sent to users who got earlier ones.
 */
export async function sendUtAnnouncementEmail({
  userId,
  email,
  firstName,
  campaignId,
}: {
  userId: string;
  email: string;
  firstName?: string | null;
  campaignId: string;
}): Promise<UtAnnouncementResult> {
  try {
    if (
      await hasCampaignBeenSent(userId, UT_ANNOUNCEMENT_CAMPAIGNS_KEY, campaignId)
    ) {
      console.log(
        `[email] utAnnouncement ${campaignId} already sent for ${userId} — skipping`,
      );
      return "skipped";
    }

    const result = await sendTemplateEmail({
      type: "utAnnouncement",
      to: email,
      orgSlug: UT_ORG_SLUG,
      variables: { firstName: firstName || "there" },
      // Guards against a double send if the flag write below fails and the
      // batch is re-run within Resend's 24h idempotency window.
      idempotencyKey: `ut-announcement/${campaignId}/${userId}`,
    });

    if (result.ok) {
      await markCampaignSent(userId, UT_ANNOUNCEMENT_CAMPAIGNS_KEY, campaignId);
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
