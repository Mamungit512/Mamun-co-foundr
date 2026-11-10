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
    expect(buildMeetupEmail("proposed", ctx()).subject).toBe("Hannah B. wants to meet, Tue Oct 20");
  });
  it("accepted: 'Confirmed: meetup {date}, {time}'", () => {
    expect(buildMeetupEmail("accepted", ctx()).subject).toBe("Confirmed: meetup Tue Oct 20, 4:00 PM");
  });
  it("declined: '{First name} can't make {date}'", () => {
    expect(buildMeetupEmail("declined", ctx()).subject).toBe("Ethan can't make Tue Oct 20");
  });
  it("does not HTML-escape the subject (it is a plain-text header)", () => {
    const c = ctx({}, { people: { [PROPOSER]: { firstName: "Siobhan", lastName: "O'Brien" }, [RECIPIENT]: { firstName: "E", lastName: "C" } } });
    expect(buildMeetupEmail("proposed", c).subject).toBe("Siobhan O. wants to meet, Tue Oct 20");
    const d = ctx({}, { people: { [PROPOSER]: { firstName: "H", lastName: "B" }, [RECIPIENT]: { firstName: "D'Arcy", lastName: "C" } } });
    expect(buildMeetupEmail("declined", d).subject).toBe("D'Arcy can't make Tue Oct 20");
  });
});

describe("variants", () => {
  it("proposed", () => {
    const v = buildMeetupEmail("proposed", ctx()).variables;
    expect(v.heading).toBe("Hannah wants to meet you on campus");
    expect(v.ctaLabel).toBe("Respond");
    expect(v.locationName).toBe("Synthetic Lounge");
    expect(v.locationDetail).toBe("Synthetic Hall");
    expect(v.whenLabel).toBe("Tue Oct 20 · 4:00 PM Central");
    expect(v.noteLabel).toBe("Note");
    expect(v.noteText).toBe("“Coffee and compare notes on the pitch?”");
  });

  it("accepted reads the same for both students and includes the note", () => {
    const v = buildMeetupEmail("accepted", ctx()).variables;
    expect(v.heading).toBe("Your meetup is confirmed");
    expect(v.ctaLabel).toBe("View meetup");
    expect(v.noteText).toContain("Coffee");
  });

  it("declined has no reason and no note, and says they are still matched", () => {
    const { variables: v } = buildMeetupEmail("declined", ctx());
    expect(v.heading).toBe("Ethan can't make this one");
    expect(v.body).toContain("No reason is shared.");
    expect(v.body).toContain("still matched");
    expect(v.ctaLabel).toBe("Propose another time");
    expect(v.noteLabel).toBe("");
    expect(v.noteText).toBe("");
    // The note must not leak into any field of a decline email.
    expect(JSON.stringify(v)).not.toContain("Coffee");
  });

  it("leaves the note empty when there isn't one", () => {
    for (const variant of ["proposed", "accepted"] as const) {
      const v = buildMeetupEmail(variant, ctx({ note: null })).variables;
      expect(v.noteLabel).toBe("");
      expect(v.noteText).toBe("");
    }
  });

  it("has an empty location detail when the spot has no building", () => {
    const v = buildMeetupEmail("proposed", ctx({ location: { name: "Spot", building: null } })).variables;
    expect(v.locationDetail).toBe("");
  });

  it("supplies exactly the variables the template declares, all strings", () => {
    const keys = [
      "primaryColor", "wordmark", "heading", "body", "locationName", "locationDetail",
      "whenLabel", "noteLabel", "noteText", "ctaLabel", "ctaUrl",
    ];
    for (const variant of ["proposed", "accepted", "declined"] as const) {
      const v = buildMeetupEmail(variant, ctx()).variables as unknown as Record<string, unknown>;
      expect(Object.keys(v).sort()).toEqual([...keys].sort());
      for (const k of keys) expect(typeof v[k]).toBe("string");
    }
  });

  it("uses the school's colour and name", () => {
    const v = buildMeetupEmail("proposed", ctx()).variables;
    expect(v.primaryColor).toBe("#BF5700");
    expect(v.wordmark).toBe("University of Texas at Austin");
  });

  it("uses no em-dashes in anything a student reads", () => {
    for (const variant of ["proposed", "accepted", "declined"] as const) {
      const { subject, variables: v } = buildMeetupEmail(variant, ctx());
      for (const text of [subject, v.heading, v.body, v.ctaLabel, v.noteLabel]) {
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
      const v = buildMeetupEmail(variant, c).variables;
      const all = Object.values(v).join("\n");
      expect(all).not.toContain("<img");
      expect(all).not.toContain("<b>");
    }
    const proposed = buildMeetupEmail("proposed", c).variables;
    expect(proposed.noteText).toContain("&lt;img");
    expect(proposed.locationName).toContain("&lt;img");
    expect(proposed.heading).toContain("&lt;img");
  });

  it("escapes the school name", () => {
    const c = ctx({}, { org: { slug: "ut", name: "A & B <U>", subdomain: "ut" } });
    expect(buildMeetupEmail("proposed", c).variables.wordmark).toBe("A &amp; B &lt;U&gt;");
  });
});

describe("links", () => {
  it("points at the pair's chat on the school's subdomain", () => {
    expect(buildMeetupEmail("proposed", ctx()).variables.ctaUrl).toBe(
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
    expect(buildMeetupEmail("proposed", c).subject).toBe("Your match wants to meet, Tue Oct 20");
    expect(buildMeetupEmail("declined", c).variables.heading).toBe("Your match can't make this one");
  });
});
