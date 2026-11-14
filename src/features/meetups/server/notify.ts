import type { SendResult } from "@/lib/email/send";
import type { MeetupEmailVariables } from "@/lib/email/catalog";
import {
  buildMeetupEmail,
  meetupFrom,
  type MeetupEmailContext,
} from "../emailContent";
import { emailsFor, type MeetupEmailClaimColumn, type MeetupEmailVariant } from "../rules";

/**
 * Orchestrates the emails for one meetup event, with its I/O injected so the
 * idempotency behavior is unit-tested.
 *
 * "Queued" here means: the request commits the status change and returns, and
 * this runs afterwards (Next's after()). It never throws, so it can never fail
 * a request, and it is safe to run twice for the same event.
 *
 * Never-double-send: each email's claim column on the meetups row is set
 * BEFORE calling Resend, atomically (UPDATE ... WHERE column IS NULL). A second
 * run, a retried job or a double click loses the claim and sends nothing.
 * Resend's Idempotency-Key is a second guard. There is no retry: a send that
 * fails after its claim is logged and not repeated.
 *
 * Logs never include the note, a recipient address or a name.
 */

export type MeetupEmailDeps = {
  /** Everything needed to build the emails, or null if the meetup is gone. */
  load(
    meetupId: string,
  ): Promise<(MeetupEmailContext & { emails: Record<string, string | null> }) | null>;
  /** Atomically set the claim column where it is NULL. True only for the winner. */
  claim(meetupId: string, column: MeetupEmailClaimColumn): Promise<boolean>;
  send(args: {
    to: string;
    orgSlug: string;
    from: string;
    subject: string;
    variables: MeetupEmailVariables;
    idempotencyKey: string;
  }): Promise<SendResult>;
};

export async function runMeetupEmails(
  meetupId: string,
  event: MeetupEmailVariant,
  deps: MeetupEmailDeps,
): Promise<void> {
  try {
    const ctx = await deps.load(meetupId);
    if (!ctx) {
      console.warn("[meetup-email] meetup not found, nothing to send");
      return;
    }

    const built = buildMeetupEmail(event, ctx);
    const from = meetupFrom(ctx.org.slug, ctx.org.name);

    await Promise.all(
      emailsFor(event, ctx.meetup).map(async (planned) => {
        try {
          const to = ctx.emails[planned.toUserId];
          if (!to) {
            console.warn(`[meetup-email] ${planned.variant}: recipient has no address`);
            return;
          }

          // Claim first. Losing means it was already sent (or is being sent).
          if (!(await deps.claim(meetupId, planned.claimColumn))) return;

          const result = await deps.send({
            to,
            orgSlug: ctx.org.slug,
            from,
            subject: built.subject,
            variables: built.variables,
            idempotencyKey: `meetup/${meetupId}/${planned.variant}/${planned.toUserId}`,
          });
          if (!result.ok) {
            console.error(`[meetup-email] ${planned.variant} not sent (${result.reason})`);
          }
        } catch {
          console.error(`[meetup-email] ${planned.variant} failed`);
        }
      }),
    );
  } catch {
    console.error("[meetup-email] failed");
  }
}
