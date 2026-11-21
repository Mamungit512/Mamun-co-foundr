import { clerkClient } from "@clerk/nextjs/server";
import type { EmailType } from "@/lib/email/catalog";
import { sendTemplateEmail } from "@/lib/email/send";
import type { MeetupEmailVariant } from "../rules";
import { claimEmail, getMeetupEmailBase } from "./data";
import { runMeetupEmails, type MeetupEmailDeps } from "./notify";

/** Primary address, falling back to the first one on the account. */
async function addressesFor(userIds: string[]): Promise<Record<string, string | null>> {
  const clerk = await clerkClient();
  const entries = await Promise.all(
    userIds.map(async (id) => {
      try {
        const u = await clerk.users.getUser(id);
        return [id, u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? null] as const;
      } catch {
        return [id, null] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}

const EMAIL_TYPE_BY_VARIANT = {
  proposed: "meetupProposed",
  accepted: "meetupAccepted",
  declined: "meetupDeclined",
} as const satisfies Record<MeetupEmailVariant, EmailType>;

const realDeps: MeetupEmailDeps = {
  async load(meetupId) {
    const base = await getMeetupEmailBase(meetupId);
    if (!base) return null;
    const emails = await addressesFor([
      base.meetup.proposerUserId,
      base.meetup.recipientUserId,
    ]);
    return { ...base, emails };
  },
  claim: claimEmail,
  send: ({ variant, to, orgSlug, from, subject, variables, idempotencyKey }) =>
    sendTemplateEmail({
      type: EMAIL_TYPE_BY_VARIANT[variant],
      to,
      orgSlug,
      from,
      subject,
      variables,
      idempotencyKey,
    }),
};

/**
 * Send the emails for one meetup event. Call from after(): it never throws and
 * never double-sends (see notify.ts).
 */
export function sendMeetupEmails(meetupId: string, event: MeetupEmailVariant): Promise<void> {
  return runMeetupEmails(meetupId, event, realDeps);
}
