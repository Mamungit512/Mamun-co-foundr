import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MeetupCard from "./MeetupCard";
import type { MeetupDto } from "./types";

// Synthetic ids only.
const ME = "user_Alice";
const THEM = "user_Bob";

const meetup = (over: Partial<MeetupDto> = {}): MeetupDto => ({
  id: "m1",
  status: "proposed",
  proposerUserId: ME,
  recipientUserId: THEM,
  startsAt: "2026-10-20T21:00:00.000Z", // Tue Oct 20, 4:00 PM Central
  note: null,
  createdAt: "2026-10-19T15:00:00.000Z",
  respondedAt: null,
  location: {
    id: "l1",
    name: "Synthetic Lounge",
    building: "Synthetic Hall",
    isActive: true,
  },
  ...over,
});

function render(m: MeetupDto, viewerId: string | null = ME) {
  return renderToStaticMarkup(
    createElement(MeetupCard, {
      meetup: m,
      viewerId,
      otherName: "Bob B.",
      otherFirstName: "Bob",
      onAccept: () => {},
      onDecline: () => {},
      onProposeAnother: () => {},
    }),
  );
}

describe("MeetupCard", () => {
  it("shows where and when in Central", () => {
    const html = render(meetup());
    expect(html).toContain("Synthetic Lounge");
    expect(html).toContain("Synthetic Hall");
    expect(html).toContain("Tue Oct 20 · 4:00 PM Central");
  });

  it("proposer sees Proposed and Waiting on, with no buttons", () => {
    const html = render(meetup(), ME);
    expect(html).toContain("Meetup with Bob B.");
    expect(html).toContain("Proposed");
    expect(html).toContain("Waiting on Bob. You&#x27;ll get an email when they answer.");
    expect(html).not.toContain("Accept");
    expect(html).not.toContain("Decline");
  });

  it("recipient sees Accept and Decline", () => {
    const html = render(meetup(), THEM);
    expect(html).toContain("Bob B. wants to meet");
    expect(html).toContain("Accept");
    expect(html).toContain("Decline");
    expect(html).not.toContain("Waiting on");
  });

  it("confirmed reads the same to both, without buttons", () => {
    for (const viewer of [ME, THEM]) {
      const html = render(meetup({ status: "accepted" }), viewer);
      expect(html).toContain("Confirmed");
      expect(html).not.toContain("Accept<");
      expect(html).not.toContain("Decline");
    }
  });

  it("declined proposer sees the no-reason message and Propose another time", () => {
    const html = render(meetup({ status: "declined" }), ME);
    expect(html).toContain("Declined");
    expect(html).toContain("Bob can&#x27;t make this one. No reason is shown.");
    expect(html).toContain("Propose another time");
  });

  it("declined recipient sees You declined, and no way to propose from the card", () => {
    const html = render(meetup({ status: "declined" }), THEM);
    expect(html).toContain("You declined. Bob was emailed and can propose again.");
    expect(html).not.toContain("Propose another time");
  });

  it("never renders a reason", () => {
    expect(render(meetup({ status: "declined" }), ME).toLowerCase()).not.toContain("because");
  });

  it("shows the note in quotes, only when there is one", () => {
    expect(render(meetup({ note: "Coffee?" }))).toContain("“Coffee?”");
    expect(render(meetup({ note: null }))).not.toContain("Note");
  });

  it("escapes a hostile note", () => {
    const html = render(meetup({ note: '<img src=x onerror="alert(1)">' }));
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("still shows a location an admin has since switched off", () => {
    const m = meetup({
      location: { id: "l1", name: "Closed Spot", building: null, isActive: false },
    });
    expect(render(m)).toContain("Closed Spot");
  });

  it("renders nothing for a non-participant or signed-out viewer", () => {
    expect(render(meetup(), "user_Carol")).toBe("");
    expect(render(meetup(), null)).toBe("");
  });
});
