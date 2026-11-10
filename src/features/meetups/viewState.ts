import type { MeetupDto } from "./types";

/**
 * Which "Propose a meetup" pill to show in the chat header.
 *   loading       nothing yet (do not flash the wrong state)
 *   hidden        a request is open, or a confirmed meetup is still ahead
 *   unmatched     gray; tooltip + toast explain why it is not available
 *   no_locations  matched, but the school has no active spots yet
 *   available     opens the propose form
 *
 * A declined meetup, or a confirmed one whose time has passed, lets either
 * student propose again.
 */
export type PillState = "loading" | "hidden" | "unmatched" | "no_locations" | "available";

export function pillState(args: {
  matched: boolean | undefined;
  meetup: MeetupDto | null | undefined;
  locationCount: number | undefined;
  now: Date;
}): PillState {
  const { matched, meetup, locationCount, now } = args;
  if (matched === undefined) return "loading";
  if (!matched) return "unmatched";
  if (meetup?.status === "proposed") return "hidden";
  if (meetup?.status === "accepted" && new Date(meetup.startsAt).getTime() > now.getTime()) {
    return "hidden";
  }
  if (locationCount === undefined) return "loading";
  if (locationCount === 0) return "no_locations";
  return "available";
}

/** Which card the viewer sees for their latest meetup with this person. */
export type CardState =
  | "waiting" // proposer, waiting on the other student
  | "respond" // recipient, Accept / Decline
  | "confirmed"
  | "declined_proposer"
  | "declined_recipient";

export function cardState(
  meetup: MeetupDto | null | undefined,
  viewerId: string | null | undefined,
): CardState | null {
  if (!meetup || !viewerId) return null;
  const isProposer = viewerId === meetup.proposerUserId;
  const isRecipient = viewerId === meetup.recipientUserId;
  if (!isProposer && !isRecipient) return null;

  switch (meetup.status) {
    case "proposed":
      return isProposer ? "waiting" : "respond";
    case "accepted":
      return "confirmed";
    case "declined":
      return isProposer ? "declined_proposer" : "declined_recipient";
  }
}

/** "Ethan C." from first and last name; falls back gracefully. */
export function shortName(first: string | null | undefined, last: string | null | undefined): string {
  const f = (first ?? "").trim();
  const l = (last ?? "").trim();
  if (f && l) return `${f} ${l[0].toUpperCase()}.`;
  return f || "your match";
}
