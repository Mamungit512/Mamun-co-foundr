import { describe, expect, it } from "vitest";
import {
  buildMeetupEmail,
  meetupCtaUrl,
  meetupFrom,
  type MeetupEmailContext,
} from "./emailContent";

// Synthetic people only.
const PROPOSER = "user_Hannah";
const RECIPIENT = "user_Ethan";
const CONVO = "33333333-3333-4333-8333-333333333333";

const ctx = (over: Partial<MeetupEmailContext["meetup"]> = {}, rest: Partial<MeetupEmailContext> = {}): MeetupEmailContext => ({
  meetup: {
    id: "m1",
    proposerUserId: PROPOSER,
    recipientUserId: RECIPIENT,
    startsAt: "2026-10-20T21:00:00.000Z", // Tue Oct 20, 4:00 PM Central
    note: "Coffee and compare notes on the pitch?",
    location: { name: "Synthetic Lounge", building: "Synthetic Hall" },
    ...over,
  },
  org: { slug: "ut", name: "University of Texas at Austin", subdomain: "ut" },
  people: {
    [PROPOSER]: { firstName: "Hannah", lastName: "Baker" },
    [RECIPIENT]: { firstName: "Ethan", lastName: "Cole" },
  },
  conversationId: CONVO,
  ...rest,
});

describe("subjects", () => {
  it("proposed: '{Proposer} wants to meet, {date}'", () => {
    expect(buildMeetupEmail("proposed", ctx(), RECIPIENT).subject).toBe("Hannah B. wants to meet, Tue Oct 20");
  });
  it("accepted: 'Confirmed: meetup {date}, {time}'", () => {
    expect(buildMeetupEmail("accepted", ctx(), RECIPIENT).subject).toBe("Confirmed: meetup Tue Oct 20, 4:00 PM");
  });
  it("declined: '{First name} can't make {date}'", () => {
    expect(buildMeetupEmail("declined", ctx(), RECIPIENT).subject).toBe("Ethan can't make Tue Oct 20");
  });
  it("does not HTML-escape the subject (it is a plain-text header)", () => {
    const c = ctx({}, { people: { [PROPOSER]: { firstName: "Siobhan", lastName: "O'Brien" }, [RECIPIENT]: { firstName: "E", lastName: "C" } } });
    expect(buildMeetupEmail("proposed", c, RECIPIENT).subject).toBe("Siobhan O. wants to meet, Tue Oct 20");
    const d = ctx({}, { people: { [PROPOSER]: { firstName: "H", lastName: "B" }, [RECIPIENT]: { firstName: "D'Arcy", lastName: "C" } } });
    expect(buildMeetupEmail("declined", d, RECIPIENT).subject).toBe("D'Arcy can't make Tue Oct 20");
  });
});

describe("variants", () => {
  it("proposed", () => {
    const v = buildMeetupEmail("proposed", ctx(), RECIPIENT).variables;
    expect(v.eyebrow).toBe("Meetup");
    expect(v.kicker).toBe("New proposal");
    expect(v.headline).toBe("Hannah wants to meet you on campus");
    expect(v.firstName).toBe("Ethan");
    expect(v.message).toBe("Hannah proposed a meetup. Accept or decline from your chat.");
    expect(v.ctaLabel).toBe("Respond");
    expect(v.locationName).toBe("Synthetic Lounge");
    expect(v.locationBuilding).toBe("Synthetic Hall");
    expect(v.meetupTime).toBe("Tue Oct 20 · 4:00 PM Central");
    expect(v.noteLabel).toBe("Note");
    expect(v.note).toBe("“Coffee and compare notes on the pitch?”");
  });

  it("accepted greets each student by name and names the other one", () => {
    const toRecipient = buildMeetupEmail("accepted", ctx(), RECIPIENT).variables;
    expect(toRecipient.headline).toBe("Your meetup is confirmed");
    expect(toRecipient.kicker).toBe("Confirmed");
    expect(toRecipient.firstName).toBe("Ethan");
    expect(toRecipient.message).toContain("you and Hannah both said yes");
    expect(toRecipient.ctaLabel).toBe("View meetup");
    expect(toRecipient.note).toContain("Coffee");

    const toProposer = buildMeetupEmail("accepted", ctx(), PROPOSER).variables;
    expect(toProposer.firstName).toBe("Hannah");
    expect(toProposer.message).toContain("you and Ethan both said yes");
  });

  it("declined has no reason and no note, and says they are still matched", () => {
    const { variables: v } = buildMeetupEmail("declined", ctx(), PROPOSER);
    expect(v.headline).toBe("Ethan can't make this one");
    expect(v.firstName).toBe("Hannah");
    expect(v.message).toContain("no reason is shared");
    expect(v.message).toContain("still matched");
    expect(v.ctaLabel).toBe("Propose another time");
    expect(v.noteLabel).toBe("");
    expect(v.note).toBe("");
    // The note must not leak into any field of a decline email.
    expect(JSON.stringify(v)).not.toContain("Coffee");
  });

  it("leaves the note empty when there isn't one", () => {
    for (const variant of ["proposed", "accepted"] as const) {
      const v = buildMeetupEmail(variant, ctx({ note: null }), RECIPIENT).variables;
      expect(v.noteLabel).toBe("");
      expect(v.note).toBe("");
    }
  });

  it("has an empty building when the spot has none", () => {
    const v = buildMeetupEmail("proposed", ctx({ location: { name: "Spot", building: null } }), RECIPIENT).variables;
    expect(v.locationBuilding).toBe("");
  });

  it("supplies exactly the variables the templates declare, all strings", () => {
    const keys = [
      "eyebrow", "kicker", "headline", "firstName", "message", "locationName",
      "locationBuilding", "meetupTime", "noteLabel", "note", "ctaLabel", "ctaUrl",
    ];
    for (const variant of ["proposed", "accepted", "declined"] as const) {
      const v = buildMeetupEmail(variant, ctx(), RECIPIENT).variables as unknown as Record<string, unknown>;
      expect(Object.keys(v).sort()).toEqual([...keys].sort());
      for (const k of keys) expect(typeof v[k]).toBe("string");
    }
  });

  it("uses no em-dashes in anything a student reads", () => {
    for (const variant of ["proposed", "accepted", "declined"] as const) {
      const { subject, variables: v } = buildMeetupEmail(variant, ctx(), RECIPIENT);
      for (const text of [subject, v.eyebrow, v.kicker, v.headline, v.message, v.ctaLabel, v.noteLabel]) {
        expect(text).not.toContain("—");
      }
    }
  });
});

describe("escaping", () => {
  const hostile = '<img src=x onerror="alert(1)"> & <b>';

  it("escapes the note, names, location and building in every variable", () => {
    const c = ctx(
      { note: hostile, location: { name: hostile, building: hostile } },
      { people: { [PROPOSER]: { firstName: hostile, lastName: "B" }, [RECIPIENT]: { firstName: hostile, lastName: "C" } } },
    );
    for (const variant of ["proposed", "accepted", "declined"] as const) {
      const v = buildMeetupEmail(variant, c, RECIPIENT).variables;
      const all = Object.values(v).join("\n");
      expect(all).not.toContain("<img");
      expect(all).not.toContain("<b>");
    }
    const proposed = buildMeetupEmail("proposed", c, RECIPIENT).variables;
    expect(proposed.note).toContain("&lt;img");
    expect(proposed.locationName).toContain("&lt;img");
    expect(proposed.locationBuilding).toContain("&lt;img");
    expect(proposed.headline).toContain("&lt;img");
    expect(proposed.firstName).toContain("&lt;img");
  });
});

describe("links", () => {
  it("points at the pair's chat on the school's subdomain", () => {
    expect(buildMeetupEmail("proposed", ctx(), RECIPIENT).variables.ctaUrl).toBe(
      `https://ut.mamuncofoundr.com/matches/${CONVO}`,
    );
  });
  it("falls back to the matches page when there is no conversation", () => {
    expect(meetupCtaUrl({ slug: "ut", subdomain: "ut" }, null)).toBe("https://ut.mamuncofoundr.com/matches");
  });
  it("falls back to the slug when the school has no subdomain", () => {
    expect(meetupCtaUrl({ slug: "ut", subdomain: null }, null)).toBe("https://ut.mamuncofoundr.com/matches");
  });
  it("encodes the conversation id", () => {
    expect(meetupCtaUrl({ slug: "ut", subdomain: "ut" }, "a/b?c")).toBe("https://ut.mamuncofoundr.com/matches/a%2Fb%3Fc");
  });
});

describe("from address", () => {
  it("is 'UT Austin Co-Foundr <meetups@mamuncofoundr.com>' for UT", () => {
    expect(meetupFrom("ut", "University of Texas at Austin")).toBe(
      "UT Austin Co-Foundr <meetups@mamuncofoundr.com>",
    );
  });
  it("falls back to the school name for a school without a configured name", () => {
    expect(meetupFrom("unknown-school", "Some College")).toBe("Some College Co-Foundr <meetups@mamuncofoundr.com>");
  });
});

describe("names", () => {
  it("falls back gracefully when a profile has no name", () => {
    const c = ctx({}, { people: {} });
    expect(buildMeetupEmail("proposed", c, RECIPIENT).subject).toBe("Your match wants to meet, Tue Oct 20");
    expect(buildMeetupEmail("declined", c, RECIPIENT).variables.headline).toBe("Your match can't make this one");
    expect(buildMeetupEmail("declined", c, RECIPIENT).variables.firstName).toBe("there");
  });
});
