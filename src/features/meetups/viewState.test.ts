import { describe, expect, it } from "vitest";
import { cardState, pillState, shortName } from "./viewState";
import type { MeetupDto } from "./types";

// Synthetic ids only.
const ME = "user_Alice";
const THEM = "user_Bob";
const NOW = new Date("2026-11-05T15:00:00Z");

const meetup = (over: Partial<MeetupDto> = {}): MeetupDto => ({
  id: "m1",
  status: "proposed",
  proposerUserId: ME,
  recipientUserId: THEM,
  startsAt: "2026-11-06T22:00:00.000Z",
  note: null,
  createdAt: "2026-11-05T15:00:00.000Z",
  respondedAt: null,
  location: { id: "l1", name: "Synthetic Lounge", building: null, isActive: true },
  ...over,
});

describe("pillState", () => {
  const base = { matched: true, meetup: null, locationCount: 3, now: NOW };

  it("shows nothing until the match status is known", () => {
    expect(pillState({ ...base, matched: undefined })).toBe("loading");
  });

  it("is gray for an unmatched pair, whatever else is loaded", () => {
    expect(pillState({ ...base, matched: false })).toBe("unmatched");
    expect(pillState({ ...base, matched: false, locationCount: undefined })).toBe("unmatched");
  });

  it("is available for a matched pair with no meetup yet", () => {
    expect(pillState(base)).toBe("available");
  });

  it("is hidden while a request is open, for either student", () => {
    expect(pillState({ ...base, meetup: meetup({ status: "proposed" }) })).toBe("hidden");
  });

  it("is hidden for a confirmed meetup that is still ahead", () => {
    expect(pillState({ ...base, meetup: meetup({ status: "accepted" }) })).toBe("hidden");
  });

  it("comes back once a confirmed meetup's time has passed", () => {
    const past = meetup({ status: "accepted", startsAt: "2026-11-04T22:00:00.000Z" });
    expect(pillState({ ...base, meetup: past })).toBe("available");
  });

  it("comes back after a decline", () => {
    expect(pillState({ ...base, meetup: meetup({ status: "declined" }) })).toBe("available");
  });

  it("waits for locations, then flags a school with none", () => {
    expect(pillState({ ...base, locationCount: undefined })).toBe("loading");
    expect(pillState({ ...base, locationCount: 0 })).toBe("no_locations");
  });

  it("does not need locations to stay hidden", () => {
    expect(
      pillState({ ...base, meetup: meetup({ status: "proposed" }), locationCount: undefined }),
    ).toBe("hidden");
  });
});

describe("cardState", () => {
  it("proposer waits, recipient responds", () => {
    expect(cardState(meetup(), ME)).toBe("waiting");
    expect(cardState(meetup(), THEM)).toBe("respond");
  });

  it("confirmed looks the same to both", () => {
    expect(cardState(meetup({ status: "accepted" }), ME)).toBe("confirmed");
    expect(cardState(meetup({ status: "accepted" }), THEM)).toBe("confirmed");
  });

  it("declined differs by role", () => {
    expect(cardState(meetup({ status: "declined" }), ME)).toBe("declined_proposer");
    expect(cardState(meetup({ status: "declined" }), THEM)).toBe("declined_recipient");
  });

  it("shows nothing without a meetup, a viewer, or for a non-participant", () => {
    expect(cardState(null, ME)).toBeNull();
    expect(cardState(meetup(), null)).toBeNull();
    expect(cardState(meetup(), "user_Carol")).toBeNull();
  });

  it("works when the other student is the proposer", () => {
    const m = meetup({ proposerUserId: THEM, recipientUserId: ME });
    expect(cardState(m, ME)).toBe("respond");
    expect(cardState(m, THEM)).toBe("waiting");
  });
});

describe("shortName", () => {
  it("is first name plus last initial", () => {
    expect(shortName("Ethan", "Cole")).toBe("Ethan C.");
    expect(shortName(" ethan ", " cole ")).toBe("ethan C.");
  });
  it("falls back to the first name, then a generic label", () => {
    expect(shortName("Ethan", null)).toBe("Ethan");
    expect(shortName(null, "Cole")).toBe("your match");
    expect(shortName(undefined, undefined)).toBe("your match");
  });
});
