import { escapeHtml } from "@/lib/html";
import type {
  MeetupProposedEmailVariables,
  MeetupResponseEmailVariables,
} from "@/lib/email/catalog";
import { getOrgConfig } from "@/features/school/registry/registry";
import { formatChicagoParts, type MeetupEmailVariant } from "./rules";

/**
 * Pure: turns a meetup into the subject and template variables for one email
 * variant. No I/O, so every guardrail here is unit-tested.
 *
 *  - Times are Central.
 *  - There is no decline reason anywhere (there is no reason to include).
 *  - The note appears only in proposed and accepted emails, which go to the
 *    two students in the pair. It never appears in a decline email.
 *  - Resend substitutes {{{triple-brace}}} variables as raw HTML, so every
 *    user-derived value (names, location, note) is HTML-escaped here. The
 *    subject is a plain-text header and is not escaped.
 */

export const MEETUP_FROM_ADDRESS = "meetups@mamuncofoundr.com";

export type EmailPerson = { firstName: string | null; lastName: string | null };

export type MeetupEmailContext = {
  meetup: {
    id: string;
    proposerUserId: string;
    recipientUserId: string;
    startsAt: string;
    note: string | null;
    location: { name: string; building: string | null };
  };
  org: { slug: string; name: string; subdomain: string | null };
  /** First and last names only; addresses never enter the content builder. */
  people: Record<string, EmailPerson>;
  /** The pair's chat conversation, if one exists. */
  conversationId: string | null;
};

export type MeetupEmailVariables = MeetupProposedEmailVariables | MeetupResponseEmailVariables;

export type BuiltMeetupEmail<V extends MeetupEmailVariables = MeetupEmailVariables> = {
  subject: string;
  variables: V;
};

const first = (p: EmailPerson | undefined) => (p?.firstName ?? "").trim() || "Your match";

const greetingName = (p: EmailPerson | undefined) => (p?.firstName ?? "").trim() || "there";

function short(p: EmailPerson | undefined): string {
  const f = first(p);
  const l = (p?.lastName ?? "").trim();
  return l && (p?.firstName ?? "").trim() ? `${f} ${l[0].toUpperCase()}.` : f;
}

/** "UT Austin Co-Foundr <meetups@mamuncofoundr.com>" */
export function meetupFrom(orgSlug: string, fallbackName: string): string {
  const cfg = getOrgConfig(orgSlug);
  const name = cfg?.emailFromName ?? `${cfg?.branding.wordmark ?? fallbackName} Co-Foundr`;
  return `${name} <${MEETUP_FROM_ADDRESS}>`;
}

/** Where the buttons go: the pair's chat on the school's own subdomain. */
export function meetupCtaUrl(
  org: { slug: string; subdomain: string | null },
  conversationId: string | null,
): string {
  const origin = `https://${org.subdomain ?? org.slug}.mamuncofoundr.com`;
  return `${origin}/matches${conversationId ? `/${encodeURIComponent(conversationId)}` : ""}`;
}

export function buildMeetupEmail(
  variant: "proposed",
  ctx: MeetupEmailContext,
  toUserId: string,
): BuiltMeetupEmail<MeetupProposedEmailVariables>;
export function buildMeetupEmail(
  variant: "accepted" | "declined",
  ctx: MeetupEmailContext,
  toUserId: string,
): BuiltMeetupEmail<MeetupResponseEmailVariables>;
export function buildMeetupEmail(
  variant: MeetupEmailVariant,
  ctx: MeetupEmailContext,
  toUserId: string,
): BuiltMeetupEmail;
export function buildMeetupEmail(
  variant: MeetupEmailVariant,
  ctx: MeetupEmailContext,
  /** The student this copy is for; it fills the "Hi {firstName}" greeting. */
  toUserId: string,
): BuiltMeetupEmail {
  const { meetup, org } = ctx;
  const proposer = ctx.people[meetup.proposerUserId];
  const recipient = ctx.people[meetup.recipientUserId];
  const other = ctx.people[toUserId === meetup.proposerUserId ? meetup.recipientUserId : meetup.proposerUserId];
  const { date, time } = formatChicagoParts(meetup.startsAt);

  const common = {
    firstName: escapeHtml(greetingName(ctx.people[toUserId])),
    locationName: escapeHtml(meetup.location.name),
    locationBuilding: escapeHtml(meetup.location.building ?? ""),
    meetupTime: `${date} · ${time} Central`,
    ctaUrl: meetupCtaUrl(org, ctx.conversationId),
  };

  switch (variant) {
    case "proposed": {
      // The note goes only in the proposal, to the other student in the pair.
      const note = meetup.note
        ? { noteLabel: "Note", note: `“${escapeHtml(meetup.note)}”` }
        : { noteLabel: "", note: "" };
      return {
        subject: `${short(proposer)} wants to meet, ${date}`,
        variables: {
          ...common,
          ...note,
          eyebrow: "Meetup",
          kicker: "New proposal",
          headline: `${escapeHtml(first(proposer))} wants to meet you on campus`,
          message: `${escapeHtml(first(proposer))} proposed a meetup. Accept or decline from your chat.`,
          ctaLabel: "Respond",
        },
      };
    }
    case "accepted":
      return {
        subject: `Confirmed: meetup ${date}, ${time}`,
        variables: { ...common, matchName: escapeHtml(first(other)) },
      };
    case "declined":
      return {
        subject: `${first(recipient)} can't make ${date}`,
        variables: { ...common, matchName: escapeHtml(first(recipient)) },
      };
  }
}
