import { describe, expect, it } from "vitest";
import {
  canRespond,
  chicagoLocalToUtc,
  emailsFor,
  formatChicago,
  formatChicagoParts,
  validateProposal,
  type ProposalInput,
} from "./rules";

// Synthetic ids only.
const ORG = "org-ut";
const OTHER_ORG = "org-other";
const NOW = new Date("2026-11-05T15:00:00Z"); // 9:00 AM CST Thu Nov 5

const activeLoc = { id: "loc-1", organizationId: ORG, isActive: true };

function input(over: Partial<ProposalInput> = {}): ProposalInput {
  return {
    location: activeLoc,
    organizationId: ORG,
    startsAtLocal: "2026-11-06T16:00",
    note: "Coffee and compare notes",
    now: NOW,
    ...over,
  };
}

describe("chicagoLocalToUtc", () => {
  it("uses CDT (UTC-5) in October", () => {
    expect(chicagoLocalToUtc("2026-10-20T16:00")?.toISOString()).toBe(
      "2026-10-20T21:00:00.000Z",
    );
  });

  it("uses CST (UTC-6) in November", () => {
    expect(chicagoLocalToUtc("2026-11-05T16:00")?.toISOString()).toBe(
      "2026-11-05T22:00:00.000Z",
    );
  });

  it("accepts seconds in the input", () => {
    expect(chicagoLocalToUtc("2026-11-05T16:00:00")?.toISOString()).toBe(
      "2026-11-05T22:00:00.000Z",
    );
  });

  it("handles the spring-forward boundary (Mar 8 2026)", () => {
    expect(chicagoLocalToUtc("2026-03-08T01:59")?.toISOString()).toBe(
      "2026-03-08T07:59:00.000Z",
    );
    expect(chicagoLocalToUtc("2026-03-08T03:00")?.toISOString()).toBe(
      "2026-03-08T08:00:00.000Z",
    );
  });

  it("rejects a time that does not exist (spring-forward gap)", () => {
    expect(chicagoLocalToUtc("2026-03-08T02:30")).toBeNull();
  });

  it("resolves an ambiguous fall-back time to a real Central time (Nov 1 2026)", () => {
    const d = chicagoLocalToUtc("2026-11-01T01:30");
    expect(d).not.toBeNull();
    expect(formatChicagoParts(d!).time).toBe("1:30 AM");
  });

  it("rejects malformed input and impossible dates", () => {
    expect(chicagoLocalToUtc("")).toBeNull();
    expect(chicagoLocalToUtc("tomorrow")).toBeNull();
    expect(chicagoLocalToUtc("2026-02-30T10:00")).toBeNull();
    expect(chicagoLocalToUtc("2026-13-01T10:00")).toBeNull();
    expect(chicagoLocalToUtc("2026-11-05T25:00")).toBeNull();
  });
});

describe("formatChicago", () => {
  it("renders Central date and time", () => {
    expect(formatChicago("2026-10-20T21:00:00.000Z")).toBe("Tue Oct 20 · 4:00 PM");
    expect(formatChicagoParts("2026-10-20T21:00:00.000Z")).toEqual({
      date: "Tue Oct 20",
      time: "4:00 PM",
    });
  });

  it("follows the Central offset across DST", () => {
    // Same UTC clock time, different Central hour either side of Nov 1.
    expect(formatChicagoParts("2026-10-31T21:00:00.000Z").time).toBe("4:00 PM");
    expect(formatChicagoParts("2026-11-02T21:00:00.000Z").time).toBe("3:00 PM");
  });

  it("uses plain spaces (no narrow no-break space before PM)", () => {
    expect(formatChicagoParts("2026-10-20T21:00:00.000Z").time).not.toMatch(/ /);
  });
});

describe("validateProposal", () => {
  it("accepts a valid proposal and returns UTC + trimmed note", () => {
    const r = validateProposal(input({ note: "  hello  " }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.startsAt.toISOString()).toBe("2026-11-06T22:00:00.000Z");
      expect(r.value.note).toBe("hello");
    }
  });

  it("treats a blank or missing note as null", () => {
    for (const note of ["", "   ", null, undefined]) {
      const r = validateProposal(input({ note }));
      expect(r.ok && r.value.note).toBeNull();
    }
  });

  describe("location", () => {
    it("is required", () => {
      const r = validateProposal(input({ location: null }));
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.location).toBeDefined();
    });

    it("must be active", () => {
      const r = validateProposal(
        input({ location: { ...activeLoc, isActive: false } }),
      );
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.location).toBeDefined();
    });

    it("must belong to the proposer's school", () => {
      const r = validateProposal(
        input({ location: { ...activeLoc, organizationId: OTHER_ORG } }),
      );
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.location).toBeDefined();
    });

    it("gives the same message for inactive and other-school", () => {
      const a = validateProposal(input({ location: { ...activeLoc, isActive: false } }));
      const b = validateProposal(
        input({ location: { ...activeLoc, organizationId: OTHER_ORG } }),
      );
      if (a.ok || b.ok) throw new Error("expected both to fail");
      expect(a.errors.location).toBe(b.errors.location);
    });
  });

  describe("date and time", () => {
    it("is required", () => {
      for (const startsAtLocal of ["", "  ", null, undefined]) {
        const r = validateProposal(input({ startsAtLocal }));
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.errors.startsAt).toBe("Pick a date and time.");
      }
    });

    it("rejects garbage", () => {
      const r = validateProposal(input({ startsAtLocal: "next tuesday" }));
      expect(!r.ok && r.errors.startsAt).toBe("Pick a valid date and time.");
    });

    it("must be in the future", () => {
      // 8:00 AM CST today is before NOW (9:00 AM CST).
      const past = validateProposal(input({ startsAtLocal: "2026-11-05T08:00" }));
      expect(!past.ok && past.errors.startsAt).toBe("Pick a time in the future.");
      // Exactly now is not the future.
      const exact = validateProposal(input({ startsAtLocal: "2026-11-05T09:00" }));
      expect(!exact.ok && exact.errors.startsAt).toBe("Pick a time in the future.");
      // A minute later is fine.
      expect(validateProposal(input({ startsAtLocal: "2026-11-05T09:01" })).ok).toBe(true);
    });

    it("allows 8:00 AM through 9:00 PM Central, inclusive", () => {
      expect(validateProposal(input({ startsAtLocal: "2026-11-06T08:00" })).ok).toBe(true);
      expect(validateProposal(input({ startsAtLocal: "2026-11-06T21:00" })).ok).toBe(true);
    });

    it("rejects times outside 8 AM to 9 PM Central", () => {
      for (const t of ["07:59", "21:01", "00:00", "23:30"]) {
        const r = validateProposal(input({ startsAtLocal: `2026-11-06T${t}` }));
        expect(r.ok).toBe(false);
        if (!r.ok) {
          expect(r.errors.startsAt).toBe("Meetups run between 8 AM and 9 PM Central.");
        }
      }
    });

    it("applies the window in Central, not UTC", () => {
      // 7:00 PM CST is 01:00 UTC next day: fine in Central, outside the window in UTC.
      expect(validateProposal(input({ startsAtLocal: "2026-11-06T19:00" })).ok).toBe(true);
    });

    it("rejects a nonexistent spring-forward time", () => {
      // 2027 DST starts Mar 14; 2:30 AM does not exist. The time is also outside
      // the 8 AM to 9 PM window, so asserting the "valid date" message proves the
      // gap is caught first rather than by the hours rule.
      const r = validateProposal(input({ startsAtLocal: "2027-03-14T02:30" }));
      expect(!r.ok && r.errors.startsAt).toBe("Pick a valid date and time.");
    });
  });

  describe("note", () => {
    it("allows exactly 280 characters", () => {
      expect(validateProposal(input({ note: "x".repeat(280) })).ok).toBe(true);
    });

    it("rejects 281 characters", () => {
      const r = validateProposal(input({ note: "x".repeat(281) }));
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.note).toBeDefined();
    });

    it("counts characters, not UTF-16 units (emoji)", () => {
      expect(validateProposal(input({ note: "😀".repeat(280) })).ok).toBe(true);
      expect(validateProposal(input({ note: "😀".repeat(281) })).ok).toBe(false);
    });

    it("measures the note after trimming", () => {
      expect(validateProposal(input({ note: ` ${"x".repeat(280)} ` })).ok).toBe(true);
    });
  });

  it("reports every field error at once", () => {
    const r = validateProposal(
      input({ location: null, startsAtLocal: "", note: "x".repeat(300) }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(["location", "note", "startsAt"]);
    }
  });
});

describe("canRespond", () => {
  const meetup = {
    proposerUserId: "user_A",
    recipientUserId: "user_B",
    status: "proposed" as const,
  };

  it("lets the recipient answer an open proposal", () => {
    expect(canRespond(meetup, "user_B")).toEqual({ ok: true });
  });

  it("does not let the proposer answer", () => {
    expect(canRespond(meetup, "user_A")).toEqual({ ok: false, reason: "not_recipient" });
  });

  it("treats a stranger as a non-participant", () => {
    expect(canRespond(meetup, "user_Z")).toEqual({ ok: false, reason: "not_participant" });
  });

  it("does not let the recipient answer twice", () => {
    for (const status of ["accepted", "declined"] as const) {
      expect(canRespond({ ...meetup, status }, "user_B")).toEqual({
        ok: false,
        reason: "not_open",
      });
    }
  });

  it("checks participation before status, so a stranger learns nothing", () => {
    expect(canRespond({ ...meetup, status: "accepted" }, "user_Z")).toEqual({
      ok: false,
      reason: "not_participant",
    });
  });
});

describe("emailsFor", () => {
  const parties = { proposerUserId: "user_A", recipientUserId: "user_B" };

  it("proposed goes to the recipient only", () => {
    expect(emailsFor("proposed", parties)).toEqual([
      { variant: "proposed", toUserId: "user_B", claimColumn: "proposed_email_sent_at" },
    ]);
  });

  it("accepted goes to both, each with its own claim column", () => {
    expect(emailsFor("accepted", parties)).toEqual([
      {
        variant: "accepted",
        toUserId: "user_A",
        claimColumn: "accepted_proposer_email_sent_at",
      },
      {
        variant: "accepted",
        toUserId: "user_B",
        claimColumn: "accepted_recipient_email_sent_at",
      },
    ]);
  });

  it("declined goes to the proposer only", () => {
    expect(emailsFor("declined", parties)).toEqual([
      { variant: "declined", toUserId: "user_A", claimColumn: "declined_email_sent_at" },
    ]);
  });

  it("never reuses a claim column across recipients", () => {
    const all = (["proposed", "accepted", "declined"] as const).flatMap((e) =>
      emailsFor(e, parties),
    );
    const cols = all.map((e) => e.claimColumn);
    expect(new Set(cols).size).toBe(cols.length);
  });
});
