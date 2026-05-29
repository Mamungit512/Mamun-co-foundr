"use client";

import { FaCalendar } from "react-icons/fa6";
import { FaExternalLinkAlt } from "react-icons/fa";

const LUMA_MEETUP_URL = "https://luma.com/mamun?period=past";
const LUMA_FOOTER_URL = "https://lu.ma/mamun";

interface MeetupCardProps {
  className?: string;
}

export default function MeetupCard({ className = "" }: MeetupCardProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--ui-text)]">
          Make sure you and your potential partner coordinate which time and
          day to RSVP your meetup at UT via Luma Events.
        </p>
        <a
          href={LUMA_MEETUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--org-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <FaCalendar className="h-3.5 w-3.5" />
          Schedule meet up
        </a>
      </div>
      <div className="mt-3 flex justify-end">
        <a
          href={LUMA_FOOTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--ui-border)] px-2.5 py-1 text-xs text-[var(--ui-text-muted)] transition hover:text-[var(--ui-text)]"
        >
          <FaExternalLinkAlt className="h-2.5 w-2.5" />
          Powered by Mamun Luma Events · lu.ma/mamun
        </a>
      </div>
    </div>
  );
}
