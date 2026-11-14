import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runMeetupEmails, type MeetupEmailDeps } from "./notify";
import type { MeetupEmailClaimColumn } from "../rules";

// Synthetic people only.
const A = "user_Hannah"; // proposer
const B = "user_Ethan"; // recipient
const MEETUP = "11111111-1111-4111-8111-111111111111";
const NOTE = "SECRET-NOTE-DO-NOT-LOG";
const ADDR_A = "hannah@synthetic.test";
const ADDR_B = "ethan@synthetic.test";

const context = (over: { emails?: Record<string, string | null>; note?: string | null } = {}) => ({
  meetup: {
    id: MEETUP,
    proposerUserId: A,
    recipientUserId: B,
    startsAt: "2026-10-20T21:00:00.000Z",
    note: over.note === undefined ? NOTE : over.note,
    location: { name: "Synthetic Lounge", building: null },
  },
  org: { slug: "ut", name: "University of Texas at Austin", subdomain: "ut" },
  people: {
    [A]: { firstName: "Hannah", lastName: "Baker" },
    [B]: { firstName: "Ethan", lastName: "Cole" },
  },
  conversationId: null,
  emails: over.emails ?? { [A]: ADDR_A, [B]: ADDR_B },
});

/** A fake that behaves like the DB claim: first caller per column wins. */
function makeDeps(over: Partial<MeetupEmailDeps> = {}) {
  const claimed = new Set<string>();
  const order: string[] = [];
  const send = vi.fn(async (a: Parameters<MeetupEmailDeps["send"]>[0]) => {
    order.push(`send:${a.to}`);
    return { ok: true } as const;
  });
  const claim = vi.fn(async (_id: string, column: MeetupEmailClaimColumn) => {
    order.push(`claim:${column}`);
    if (claimed.has(column)) return false;
    claimed.add(column);
    return true;
  });
  const load = vi.fn(async () => context());
  const deps: MeetupEmailDeps = { load, claim, send, ...over };
  return { deps, send, claim, load, claimed, order };
}

let errorSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  errorSpy.mockRestore();
  warnSpy.mockRestore();
});

describe("who gets which email", () => {
  it("proposed: the recipient only", async () => {
    const { deps, send } = makeDeps();
    await runMeetupEmails(MEETUP, "proposed", deps);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({
      to: ADDR_B,
      subject: "Hannah B. wants to meet, Tue Oct 20",
      from: "UT Austin Co-Foundr <meetups@mamuncofoundr.com>",
      orgSlug: "ut",
    });
  });

  it("accepted: both students, same subject", async () => {
    const { deps, send } = makeDeps();
    await runMeetupEmails(MEETUP, "accepted", deps);
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls.map((c) => c[0].to).sort()).toEqual([ADDR_A, ADDR_B].sort());
    expect(new Set(send.mock.calls.map((c) => c[0].subject)).size).toBe(1);
  });

  it("declined: the proposer only, with no note and no reason", async () => {
    const { deps, send } = makeDeps();
    await runMeetupEmails(MEETUP, "declined", deps);
    expect(send).toHaveBeenCalledTimes(1);
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe(ADDR_A);
    expect(arg.subject).toBe("Ethan can't make Tue Oct 20");
    expect(JSON.stringify(arg)).not.toContain(NOTE);
  });
});

describe("never double-sends", () => {
  it("a retried job sends each email once", async () => {
    const { deps, send } = makeDeps();
    await runMeetupEmails(MEETUP, "accepted", deps);
    await runMeetupEmails(MEETUP, "accepted", deps); // the retry
    await runMeetupEmails(MEETUP, "accepted", deps); // and again
    expect(send).toHaveBeenCalledTimes(2); // one per student, not six
  });

  it("two runs at the same time still send each email once", async () => {
    const { deps, send } = makeDeps();
    await Promise.all([
      runMeetupEmails(MEETUP, "accepted", deps),
      runMeetupEmails(MEETUP, "accepted", deps),
      runMeetupEmails(MEETUP, "accepted", deps),
    ]);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("claims each email BEFORE calling Resend", async () => {
    const { deps, order } = makeDeps();
    await runMeetupEmails(MEETUP, "proposed", deps);
    expect(order).toEqual(["claim:proposed_email_sent_at", `send:${ADDR_B}`]);
  });

  it("a send that fails after its claim is not sent again on retry", async () => {
    const failing = vi.fn(async () => ({ ok: false, reason: "send_error" }) as const);
    const { deps, send } = makeDeps({ send: failing });
    await runMeetupEmails(MEETUP, "proposed", deps);
    await runMeetupEmails(MEETUP, "proposed", deps);
    expect(failing).toHaveBeenCalledTimes(1);
    expect(send).not.toHaveBeenCalled();
  });

  it("each event has its own claims: proposing, then accepting, sends both", async () => {
    const { deps, send } = makeDeps();
    await runMeetupEmails(MEETUP, "proposed", deps);
    await runMeetupEmails(MEETUP, "accepted", deps);
    expect(send).toHaveBeenCalledTimes(3); // 1 proposed + 2 accepted
  });

  it("sends nothing when another process already holds every claim", async () => {
    const { deps, send } = makeDeps({ claim: vi.fn(async () => false) });
    await runMeetupEmails(MEETUP, "accepted", deps);
    expect(send).not.toHaveBeenCalled();
  });

  it("gives each email a unique, stable Resend idempotency key", async () => {
    const { deps, send } = makeDeps();
    await runMeetupEmails(MEETUP, "accepted", deps);
    const keys = send.mock.calls.map((c) => c[0].idempotencyKey);
    expect(new Set(keys).size).toBe(2);
    expect(keys).toContain(`meetup/${MEETUP}/accepted/${A}`);
    expect(keys).toContain(`meetup/${MEETUP}/accepted/${B}`);
  });
});

describe("never fails the request", () => {
  it("resolves when the meetup no longer exists", async () => {
    const { deps, send } = makeDeps({ load: vi.fn(async () => null) });
    await expect(runMeetupEmails(MEETUP, "proposed", deps)).resolves.toBeUndefined();
    expect(send).not.toHaveBeenCalled();
  });

  it("resolves when loading throws", async () => {
    const { deps } = makeDeps({ load: vi.fn(async () => { throw new Error("db down"); }) });
    await expect(runMeetupEmails(MEETUP, "proposed", deps)).resolves.toBeUndefined();
  });

  it("resolves when the claim throws, and sends nothing", async () => {
    const { deps, send } = makeDeps({ claim: vi.fn(async () => { throw new Error("db down"); }) });
    await expect(runMeetupEmails(MEETUP, "accepted", deps)).resolves.toBeUndefined();
    expect(send).not.toHaveBeenCalled();
  });

  it("resolves when Resend throws, and still sends the other student's email", async () => {
    let n = 0;
    const send = vi.fn(async () => {
      if (n++ === 0) throw new Error("boom");
      return { ok: true } as const;
    });
    const { deps } = makeDeps({ send });
    await expect(runMeetupEmails(MEETUP, "accepted", deps)).resolves.toBeUndefined();
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("skips a student with no address, and still emails the other", async () => {
    const { deps, send, claimed } = makeDeps({
      load: vi.fn(async () => context({ emails: { [A]: null, [B]: ADDR_B } })),
    });
    await runMeetupEmails(MEETUP, "accepted", deps);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({ to: ADDR_B });
    // The skipped email's claim is left free rather than burned.
    expect(claimed.has("accepted_proposer_email_sent_at")).toBe(false);
  });
});

describe("privacy of logs", () => {
  it("never logs the note, an address or a name, even when everything fails", async () => {
    const failing = vi.fn(async () => {
      throw new Error(`resend rejected ${NOTE} for ${ADDR_B}`);
    });
    const { deps } = makeDeps({ send: failing });
    await runMeetupEmails(MEETUP, "proposed", deps);

    const { deps: d2 } = makeDeps({ send: vi.fn(async () => ({ ok: false, reason: "send_error" }) as const) });
    await runMeetupEmails(MEETUP, "accepted", d2);

    const { deps: d3 } = makeDeps({ load: vi.fn(async () => { throw new Error(`db said ${NOTE}`); }) });
    await runMeetupEmails(MEETUP, "declined", d3);

    const logged = JSON.stringify([...errorSpy.mock.calls, ...warnSpy.mock.calls]);
    expect(logged).not.toContain(NOTE);
    expect(logged).not.toContain("synthetic.test");
    expect(logged).not.toContain("Hannah");
    expect(logged).not.toContain("Ethan");
    expect(logged.length).toBeGreaterThan(2); // it did log something
  });
});
