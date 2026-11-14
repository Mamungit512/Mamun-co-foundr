"use client";

import { FaLocationDot } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useMeetupForPair, useMeetupLocations } from "./useMeetups";
import { pillState } from "./viewState";

const BASE = "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition";

/** "Propose a meetup" pill for the chat header. */
export default function ProposeMeetupPill({
  otherUserId,
  otherFirstName,
  onOpen,
}: {
  otherUserId: string;
  otherFirstName: string | null | undefined;
  onOpen: () => void;
}) {
  const { data } = useMeetupForPair(otherUserId);
  // Spots only matter once the pair is matched and nothing is open.
  const { data: locations } = useMeetupLocations(data?.matched === true);

  const state = pillState({
    matched: data?.matched,
    meetup: data?.meetup,
    locationCount: locations?.length,
    now: new Date(),
  });

  if (state === "loading" || state === "hidden") return null;

  const first = (otherFirstName ?? "").trim() || "them";

  // aria-disabled instead of disabled: a disabled button never fires the click
  // that shows the explanatory toast.
  if (state === "unmatched") {
    return (
      <button
        type="button"
        aria-disabled="true"
        title="Available once you match"
        onClick={() =>
          toast(`Meetups open once you and ${first} both match. Send an invite first.`)
        }
        className={`${BASE} border-[var(--ui-border)] text-[var(--ui-text-subtle)] cursor-not-allowed`}
      >
        <FaLocationDot className="h-3 w-3" />
        Propose a meetup
      </button>
    );
  }

  if (state === "no_locations") {
    return (
      <button
        type="button"
        aria-disabled="true"
        title="No meetup spots yet"
        onClick={() => toast("No meetup spots are set up yet. Check back soon.")}
        className={`${BASE} border-[var(--ui-border)] text-[var(--ui-text-subtle)] cursor-not-allowed`}
      >
        <FaLocationDot className="h-3 w-3" />
        Propose a meetup
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${BASE} border-[var(--org-primary)] text-[var(--org-primary)] hover:bg-[var(--org-primary)] hover:text-white cursor-pointer`}
    >
      <FaLocationDot className="h-3 w-3" />
      Propose a meetup
    </button>
  );
}
