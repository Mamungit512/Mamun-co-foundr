import { escapeHtml } from "@/lib/html";
import type { MeetupEmailVariables } from "@/lib/email/catalog";
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

export type BuiltMeetupEmail = {
  subject: string;
  variables: MeetupEmailVariables;
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

  const base = {
    eyebrow: "Meetup",
    firstName: escapeHtml(greetingName(ctx.people[toUserId])),
    locationName: escapeHtml(meetup.location.name),
    locationBuilding: escapeHtml(meetup.location.building ?? ""),
    meetupTime: `${date} · ${time} Central`,
    ctaUrl: meetupCtaUrl(org, ctx.conversationId),
  };

  const withNote =
    meetup.note && variant !== "declined"
      ? { noteLabel: "Note", note: `“${escapeHtml(meetup.note)}”` }
      : { noteLabel: "", note: "" };

  // The template reads "Hi {firstName} - {message}", so every message starts
  // lowercase and finishes the sentence.
  switch (variant) {
    case "proposed":
      return {
        subject: `${short(proposer)} wants to meet, ${date}`,
        variables: {
          ...base,
          ...withNote,
          kicker: "New proposal",
          headline: `${escapeHtml(first(proposer))} wants to meet you on campus`,
          message: `${escapeHtml(first(proposer))} proposed a meetup. Accept or decline from your chat.`,
          ctaLabel: "Respond",
        },
      };
    case "accepted":
      return {
        subject: `Confirmed: meetup ${date}, ${time}`,
        variables: {
          ...base,
          ...withNote,
          kicker: "Confirmed",
          headline: "Your meetup is confirmed",
          message: `you and ${escapeHtml(first(other))} both said yes. Here are the details.`,
          ctaLabel: "View meetup",
        },
      };
    case "declined":
      return {
        subject: `${first(recipient)} can't make ${date}`,
        variables: {
          ...base,
          ...withNote,
          kicker: "Update",
          headline: `${escapeHtml(first(recipient))} can't make this one`,
          message: "no reason is shared, and you're still matched. Propose another time whenever you like.",
          ctaLabel: "Propose another time",
        },
      };
  }
}
