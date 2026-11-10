import { formatChicagoParts } from "./rules";
import { cardState } from "./viewState";
import type { MeetupDto } from "./types";

const LABEL = "text-[10px] font-semibold tracking-wider uppercase text-[var(--ui-text-subtle)]";

const BADGES = {
  proposed: {
    text: "Proposed",
    cls: "border-[var(--ui-border-strong)] bg-[var(--ui-surface)] text-[var(--ui-text-muted)]",
  },
  accepted: { text: "Confirmed", cls: "border-green-300 bg-green-50 text-green-800" },
  declined: { text: "Declined", cls: "border-red-300 bg-red-50 text-red-700" },
} as const;

/**
 * One student's view of their latest meetup with this person. Presentational:
 * the container supplies the meetup and the handlers.
 */
export default function MeetupCard({
  meetup,
  viewerId,
  otherName,
  otherFirstName,
  isResponding = false,
  onAccept,
  onDecline,
  onProposeAnother,
}: {
  meetup: MeetupDto;
  viewerId: string | null | undefined;
  /** "Ethan C." */
  otherName: string;
  /** "Ethan" */
  otherFirstName: string;
  isResponding?: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onProposeAnother: () => void;
}) {
  const state = cardState(meetup, viewerId);
  if (!state) return null;

  const { date, time } = formatChicagoParts(meetup.startsAt);
  const badge = BADGES[meetup.status];
  const { location } = meetup;

  return (
    <section
      aria-label="Meetup"
      className="mb-4 rounded-xl border border-[var(--ui-border)] bg-white p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--ui-text)]">
          {state === "respond" ? `${otherName} wants to meet` : `Meetup with ${otherName}`}
        </h2>
        <span
          className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${badge.cls}`}
        >
          {badge.text}
        </span>
      </div>

      <dl className="space-y-2 rounded-lg border border-[var(--ui-border)] p-3 text-sm">
        <div className="flex gap-4">
          <dt className={`w-12 shrink-0 pt-0.5 ${LABEL}`}>Where</dt>
          <dd className="min-w-0">
            <p className="font-semibold text-[var(--ui-text)]">{location.name}</p>
            {location.building && (
              <p className="text-xs text-[var(--ui-text-muted)]">{location.building}</p>
            )}
          </dd>
        </div>
        <div className="flex gap-4">
          <dt className={`w-12 shrink-0 pt-0.5 ${LABEL}`}>When</dt>
          <dd className="font-semibold text-[var(--ui-text)]">
            {date} · {time} Central
          </dd>
        </div>
        {meetup.note && (
          <div className="flex gap-4">
            <dt className={`w-12 shrink-0 pt-0.5 ${LABEL}`}>Note</dt>
            {/* React escapes this; it is plain text. */}
            <dd className="min-w-0 break-words text-[var(--ui-text)]">
              &ldquo;{meetup.note}&rdquo;
            </dd>
          </div>
        )}
      </dl>

      {state === "waiting" && (
        <p className="mt-3 text-xs text-[var(--ui-text-muted)]">Waiting on {otherFirstName}.</p>
      )}

      {state === "confirmed" && (
        <p className="mt-3 text-xs text-[var(--ui-text-muted)]">
          Confirmed. You both have the same details.
        </p>
      )}

      {state === "declined_proposer" && (
        <>
          <p className="mt-3 text-xs text-[var(--ui-text-muted)]">
            {otherFirstName} can&apos;t make this one. No reason is shown.
          </p>
          <button
            type="button"
            onClick={onProposeAnother}
            className="mt-3 w-full rounded-lg border border-[var(--org-primary)] px-4 py-2 text-sm font-semibold text-[var(--org-primary)] transition hover:bg-[var(--org-primary)] hover:text-white cursor-pointer"
          >
            Propose another time
          </button>
        </>
      )}

      {state === "declined_recipient" && (
        <p className="mt-3 text-xs text-[var(--ui-text-muted)]">
          You declined. {otherFirstName} can propose again.
        </p>
      )}

      {state === "respond" && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onAccept}
            disabled={isResponding}
            className="flex-1 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-50 cursor-pointer"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={onDecline}
            disabled={isResponding}
            className="flex-1 rounded-lg border border-[var(--ui-border-strong)] px-4 py-2 text-sm font-semibold text-[var(--ui-text-muted)] transition hover:bg-[var(--ui-surface)] disabled:opacity-50 cursor-pointer"
          >
            Decline
          </button>
        </div>
      )}
    </section>
  );
}
