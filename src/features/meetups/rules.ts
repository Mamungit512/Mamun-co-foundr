/**
 * Pure rules for "Propose a meetup". No I/O: callers pass in everything the
 * rules need (including `now`), so every function here is unit-testable.
 *
 * Times are stored in UTC and validated/rendered in America/Chicago.
 */

export const MEETUP_TIME_ZONE = "America/Chicago";
export const MEETUP_NOTE_MAX = 280;
/** Earliest and latest allowed start, inclusive, in Central minutes since midnight. */
export const MEETUP_EARLIEST_MINUTE = 8 * 60;
export const MEETUP_LATEST_MINUTE = 21 * 60;

export type MeetupStatus = "proposed" | "accepted" | "declined";
export type MeetupEmailVariant = "proposed" | "accepted" | "declined";

/* -------------------------------------------------------------------------- */
/* Time helpers (Intl only, no date library)                                  */
/* -------------------------------------------------------------------------- */

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: MEETUP_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

type WallClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function chicagoWallClock(ms: number): WallClock & { second: number } {
  const out: Record<string, number> = {};
  for (const p of partsFormatter.formatToParts(new Date(ms))) {
    if (p.type !== "literal") out[p.type] = Number(p.value);
  }
  return {
    year: out.year,
    month: out.month,
    day: out.day,
    hour: out.hour,
    minute: out.minute,
    second: out.second,
  };
}

/** Central's offset from UTC at an instant, in ms (negative: Central is behind UTC). */
function chicagoOffsetMs(ms: number): number {
  const w = chicagoWallClock(ms);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

const LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?$/;

/**
 * Convert a `datetime-local` value ("YYYY-MM-DDTHH:mm", read as Central wall
 * time) to a UTC Date. Returns null for malformed input, impossible dates
 * (Feb 30) and Central times that do not exist (the spring-forward gap).
 */
export function chicagoLocalToUtc(local: string): Date | null {
  const m = LOCAL_RE.exec(local.trim());
  if (!m) return null;
  const [year, month, day, hour, minute] = m.slice(1, 6).map(Number);

  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const check = new Date(wall);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    check.getUTCHours() !== hour ||
    check.getUTCMinutes() !== minute
  ) {
    return null;
  }

  // Two passes so the offset is taken near the final instant (DST edges).
  const first = wall - chicagoOffsetMs(wall);
  const utc = wall - chicagoOffsetMs(first);

  // Round trip: a time inside the spring-forward gap lands on a different wall time.
  const back = chicagoWallClock(utc);
  if (
    back.year !== year ||
    back.month !== month ||
    back.day !== day ||
    back.hour !== hour ||
    back.minute !== minute
  ) {
    return null;
  }
  return new Date(utc);
}

const displayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: MEETUP_TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** { date: "Tue Oct 20", time: "4:00 PM" } in Central. */
export function formatChicagoParts(iso: string | Date): { date: string; time: string } {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const p: Record<string, string> = {};
  for (const part of displayFormatter.formatToParts(d)) {
    if (part.type !== "literal") p[part.type] = part.value;
  }
  // Assembled by hand: newer ICU puts a narrow no-break space before AM/PM.
  return {
    date: `${p.weekday} ${p.month} ${p.day}`,
    time: `${p.hour}:${p.minute} ${p.dayPeriod}`,
  };
}

/** "Tue Oct 20 · 4:00 PM" in Central. */
export function formatChicago(iso: string | Date): string {
  const { date, time } = formatChicagoParts(iso);
  return `${date} · ${time}`;
}

/* -------------------------------------------------------------------------- */
/* Validate a proposal                                                        */
/* -------------------------------------------------------------------------- */

export type ProposalLocation = {
  id: string;
  organizationId: string;
  isActive: boolean;
};

export type ProposalInput = {
  /** The row for the chosen location id, or null if no such location was found. */
  location: ProposalLocation | null;
  /** The proposer's school. */
  organizationId: string;
  /** `datetime-local` value, read as Central wall time. */
  startsAtLocal: string | null | undefined;
  note: string | null | undefined;
  now: Date;
};

export type ProposalErrors = {
  location?: string;
  startsAt?: string;
  note?: string;
};

export type ProposalResult =
  | { ok: true; value: { startsAt: Date; note: string | null } }
  | { ok: false; errors: ProposalErrors };

export function validateProposal(input: ProposalInput): ProposalResult {
  const errors: ProposalErrors = {};

  const { location } = input;
  if (!location) {
    errors.location = "Pick a campus spot.";
  } else if (location.organizationId !== input.organizationId || !location.isActive) {
    // Same message for "other school" and "switched off": no need to say which.
    errors.location = "That spot isn't available anymore.";
  }

  let startsAt: Date | null = null;
  const rawStart = input.startsAtLocal?.trim();
  if (!rawStart) {
    errors.startsAt = "Pick a date and time.";
  } else {
    startsAt = chicagoLocalToUtc(rawStart);
    if (!startsAt) {
      errors.startsAt = "Pick a valid date and time.";
    } else if (startsAt.getTime() <= input.now.getTime()) {
      errors.startsAt = "Pick a time in the future.";
    } else {
      const w = chicagoWallClock(startsAt.getTime());
      const minute = w.hour * 60 + w.minute;
      if (minute < MEETUP_EARLIEST_MINUTE || minute > MEETUP_LATEST_MINUTE) {
        errors.startsAt = "Meetups run between 8 AM and 9 PM Central.";
      }
    }
  }

  // Plain text, optional. Counted in characters (code points) to match the DB check.
  const note = (input.note ?? "").trim();
  if (Array.from(note).length > MEETUP_NOTE_MAX) {
    errors.note = `Keep the note to ${MEETUP_NOTE_MAX} characters or fewer.`;
  }

  if (errors.location || errors.startsAt || errors.note || !startsAt) {
    return { ok: false, errors };
  }
  return { ok: true, value: { startsAt, note: note === "" ? null : note } };
}

/* -------------------------------------------------------------------------- */
/* Who may respond                                                            */
/* -------------------------------------------------------------------------- */

export type MeetupParties = {
  proposerUserId: string;
  recipientUserId: string;
  status: MeetupStatus;
};

export type RespondCheck =
  | { ok: true }
  | { ok: false; reason: "not_participant" | "not_recipient" | "not_open" };

/**
 * Only the recipient answers, once. The reason lets the route pick a status:
 * not_participant -> 404 (do not reveal the meetup), the others -> 409.
 */
export function canRespond(meetup: MeetupParties, userId: string): RespondCheck {
  if (userId !== meetup.proposerUserId && userId !== meetup.recipientUserId) {
    return { ok: false, reason: "not_participant" };
  }
  if (userId !== meetup.recipientUserId) {
    return { ok: false, reason: "not_recipient" };
  }
  if (meetup.status !== "proposed") {
    return { ok: false, reason: "not_open" };
  }
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Who gets which email                                                       */
/* -------------------------------------------------------------------------- */

export type MeetupEmailClaimColumn =
  | "proposed_email_sent_at"
  | "accepted_proposer_email_sent_at"
  | "accepted_recipient_email_sent_at"
  | "declined_email_sent_at";

export type PlannedEmail = {
  variant: MeetupEmailVariant;
  toUserId: string;
  /** The meetups column to claim (set where NULL) before calling Resend. */
  claimColumn: MeetupEmailClaimColumn;
};

/**
 * proposed -> recipient only
 * accepted -> both students
 * declined -> proposer only (never carries a reason)
 */
export function emailsFor(
  event: MeetupEmailVariant,
  meetup: Pick<MeetupParties, "proposerUserId" | "recipientUserId">,
): PlannedEmail[] {
  switch (event) {
    case "proposed":
      return [
        {
          variant: "proposed",
          toUserId: meetup.recipientUserId,
          claimColumn: "proposed_email_sent_at",
        },
      ];
    case "accepted":
      return [
        {
          variant: "accepted",
          toUserId: meetup.proposerUserId,
          claimColumn: "accepted_proposer_email_sent_at",
        },
        {
          variant: "accepted",
          toUserId: meetup.recipientUserId,
          claimColumn: "accepted_recipient_email_sent_at",
        },
      ];
    case "declined":
      return [
        {
          variant: "declined",
          toUserId: meetup.proposerUserId,
          claimColumn: "declined_email_sent_at",
        },
      ];
  }
}
