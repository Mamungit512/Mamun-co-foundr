import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const auth = vi.fn();
const getOrgSlugById = vi.fn();
const isMutualMatch = vi.fn();
const listActiveLocations = vi.fn();
const getLocationForProposal = vi.fn();
const getLatestMeetupForPair = vi.fn();
const getMeetupParties = vi.fn();
const insertMeetup = vi.fn();
const respondToMeetup = vi.fn();
const checkRateLimit = vi.fn();
const sendMeetupEmails = vi.fn();
// after() only works inside a real request, so collect its callbacks and run them by hand.
const afterCallbacks: Array<() => unknown> = [];
const flushAfter = async () => {
  for (const cb of afterCallbacks.splice(0)) await cb();
};

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (cb: () => unknown) => {
    afterCallbacks.push(cb);
  },
}));
vi.mock("@/features/meetups/server/sendMeetupEmails", () => ({
  sendMeetupEmails: (...a: unknown[]) => sendMeetupEmails(...a),
}));
vi.mock("@clerk/nextjs/server", () => ({ auth: () => auth() }));
vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: (...a: unknown[]) => checkRateLimit(...a),
  rateLimitResponse: () => Response.json({ error: "slow down" }, { status: 429 }),
}));
vi.mock("@/features/meetups/server/data", () => ({
  getOrgSlugById: (...a: unknown[]) => getOrgSlugById(...a),
  isMutualMatch: (...a: unknown[]) => isMutualMatch(...a),
  listActiveLocations: (...a: unknown[]) => listActiveLocations(...a),
  getLocationForProposal: (...a: unknown[]) => getLocationForProposal(...a),
  getLatestMeetupForPair: (...a: unknown[]) => getLatestMeetupForPair(...a),
  getMeetupParties: (...a: unknown[]) => getMeetupParties(...a),
  insertMeetup: (...a: unknown[]) => insertMeetup(...a),
  respondToMeetup: (...a: unknown[]) => respondToMeetup(...a),
}));

import { GET as locationsGET } from "./locations/route";
import { GET as meetupGET, POST as proposePOST } from "./route";
import { POST as acceptPOST } from "./[id]/accept/route";
import { POST as declinePOST } from "./[id]/decline/route";

// Synthetic ids only.
const ORG = "org-ut";
const OTHER_ORG = "org-other";
const ME = "user_Alice";
const THEM = "user_Bob";
const STRANGER = "user_Carol";
const MEETUP_ID = "11111111-1111-4111-8111-111111111111";
const LOC_ID = "22222222-2222-4222-8222-222222222222";
const SECRET_NOTE = "SECRET-NOTE-DO-NOT-LOG";

const signedIn = (userId = ME, orgId: string | null = ORG) =>
  auth.mockResolvedValue({
    userId,
    sessionClaims: { metadata: orgId ? { organization_id: orgId } : {} },
  });

const post = (url: string, body?: unknown) =>
  new NextRequest(`http://localhost${url}`, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const get = (url: string) => new NextRequest(`http://localhost${url}`);
const ctxFor = (id = MEETUP_ID) => ({ params: Promise.resolve({ id }) });

const parties = (over: Record<string, unknown> = {}) => ({
  id: MEETUP_ID,
  organizationId: ORG,
  proposerUserId: THEM,
  recipientUserId: ME,
  status: "proposed",
  ...over,
});

const meetupDto = (over: Record<string, unknown> = {}) => ({
  id: MEETUP_ID,
  status: "proposed",
  proposerUserId: ME,
  recipientUserId: THEM,
  startsAt: "2026-11-06T22:00:00.000Z",
  note: null,
  createdAt: "2026-11-05T15:00:00.000Z",
  respondedAt: null,
  location: { id: LOC_ID, name: "Synthetic Lounge", building: null, isActive: true },
  ...over,
});

const validBody = (over: Record<string, unknown> = {}) => ({
  toUserId: THEM,
  locationId: LOC_ID,
  startsAtLocal: "2026-11-06T16:00",
  note: "Coffee?",
  ...over,
});

beforeEach(() => {
  vi.resetAllMocks();
  afterCallbacks.length = 0;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-05T15:00:00Z"));
  vi.stubEnv("MEETUPS_V1_ORGS", "ut");
  signedIn();
  getOrgSlugById.mockResolvedValue("ut");
  isMutualMatch.mockResolvedValue(true);
  checkRateLimit.mockResolvedValue({ allowed: true });
  getLocationForProposal.mockResolvedValue({
    id: LOC_ID,
    organizationId: ORG,
    isActive: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

/* Every endpoint, called the same way. */
const ENDPOINTS: [string, () => Promise<Response>][] = [
  ["GET /locations", () => locationsGET()],
  ["GET /meetups", () => meetupGET(get(`/api/meetups?with=${THEM}`))],
  ["POST /meetups", () => proposePOST(post("/api/meetups", validBody()))],
  ["POST /accept", () => acceptPOST(post("/x"), ctxFor())],
  ["POST /decline", () => declinePOST(post("/x"), ctxFor())],
];

describe.each(ENDPOINTS)("%s access", (_name, call) => {
  it("401 when signed out", async () => {
    auth.mockResolvedValue({ userId: null, sessionClaims: null });
    expect((await call()).status).toBe(401);
  });

  it("404 when the flag is off (env unset)", async () => {
    vi.stubEnv("MEETUPS_V1_ORGS", "");
    expect((await call()).status).toBe(404);
  });

  it("404 when the flag is on for a different school only", async () => {
    vi.stubEnv("MEETUPS_V1_ORGS", "asu");
    expect((await call()).status).toBe(404);
  });

  it("404 when the caller has no school", async () => {
    signedIn(ME, null);
    expect((await call()).status).toBe(404);
  });

  it("does no data work when the flag is off", async () => {
    vi.stubEnv("MEETUPS_V1_ORGS", "");
    await call();
    expect(isMutualMatch).not.toHaveBeenCalled();
    expect(insertMeetup).not.toHaveBeenCalled();
    expect(respondToMeetup).not.toHaveBeenCalled();
    expect(listActiveLocations).not.toHaveBeenCalled();
  });
});

describe("GET /api/meetups/locations", () => {
  it("returns the active locations for the caller's school", async () => {
    listActiveLocations.mockResolvedValue([{ id: LOC_ID, name: "Synthetic Lounge", building: null }]);
    const res = await locationsGET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      locations: [{ id: LOC_ID, name: "Synthetic Lounge", building: null }],
    });
    expect(listActiveLocations).toHaveBeenCalledWith(ORG);
  });
});

describe("GET /api/meetups?with=", () => {
  it("400 for a missing, malformed or self id", async () => {
    for (const q of ["", "?with=nope", `?with=${ME}`]) {
      expect((await meetupGET(get(`/api/meetups${q}`))).status).toBe(400);
    }
  });

  it("returns matched:false and no meetup for an unmatched pair", async () => {
    isMutualMatch.mockResolvedValue(false);
    const res = await meetupGET(get(`/api/meetups?with=${THEM}`));
    expect(await res.json()).toEqual({ matched: false, meetup: null });
    expect(getLatestMeetupForPair).not.toHaveBeenCalled();
  });

  it("returns the latest meetup for a matched pair", async () => {
    getLatestMeetupForPair.mockResolvedValue(meetupDto({ note: SECRET_NOTE }));
    const res = await meetupGET(get(`/api/meetups?with=${THEM}`));
    const json = await res.json();
    expect(json.matched).toBe(true);
    expect(json.meetup.id).toBe(MEETUP_ID);
    expect(getLatestMeetupForPair).toHaveBeenCalledWith(ORG, ME, THEM);
  });

  it("returns matched with no meetup yet", async () => {
    getLatestMeetupForPair.mockResolvedValue(null);
    const res = await meetupGET(get(`/api/meetups?with=${THEM}`));
    expect(await res.json()).toEqual({ matched: true, meetup: null });
  });
});

describe("POST /api/meetups (propose)", () => {
  it("creates a proposal: 201, UTC time, trimmed note, caller as proposer", async () => {
    insertMeetup.mockResolvedValue({ ok: true, meetup: meetupDto() });
    const res = await proposePOST(post("/api/meetups", validBody({ note: "  Coffee?  " })));
    expect(res.status).toBe(201);
    expect(insertMeetup).toHaveBeenCalledTimes(1);
    const arg = insertMeetup.mock.calls[0][0];
    expect(arg).toMatchObject({
      orgId: ORG,
      proposerUserId: ME,
      recipientUserId: THEM,
      locationId: LOC_ID,
      note: "Coffee?",
    });
    expect(arg.startsAt.toISOString()).toBe("2026-11-06T22:00:00.000Z");
  });

  it("403 when the pair is not a mutual match", async () => {
    isMutualMatch.mockResolvedValue(false);
    const res = await proposePOST(post("/api/meetups", validBody()));
    expect(res.status).toBe(403);
    expect(insertMeetup).not.toHaveBeenCalled();
  });

  it("400 for a bad body, a bad recipient id or proposing to yourself", async () => {
    const bad = [
      post("/api/meetups"),
      post("/api/meetups", validBody({ toUserId: "nope" })),
      post("/api/meetups", validBody({ toUserId: ME })),
      post("/api/meetups", validBody({ toUserId: undefined })),
    ];
    for (const req of bad) expect((await proposePOST(req)).status).toBe(400);
    expect(insertMeetup).not.toHaveBeenCalled();
  });

  it("rejects an inactive location", async () => {
    getLocationForProposal.mockResolvedValue({ id: LOC_ID, organizationId: ORG, isActive: false });
    const res = await proposePOST(post("/api/meetups", validBody()));
    expect(res.status).toBe(400);
    expect((await res.json()).fields.location).toBeDefined();
    expect(insertMeetup).not.toHaveBeenCalled();
  });

  it("rejects a location from another school", async () => {
    getLocationForProposal.mockResolvedValue({ id: LOC_ID, organizationId: OTHER_ORG, isActive: true });
    const res = await proposePOST(post("/api/meetups", validBody()));
    expect(res.status).toBe(400);
    expect(insertMeetup).not.toHaveBeenCalled();
  });

  it("rejects an unknown location and a missing location id", async () => {
    getLocationForProposal.mockResolvedValue(null);
    expect((await proposePOST(post("/api/meetups", validBody()))).status).toBe(400);
    expect(
      (await proposePOST(post("/api/meetups", validBody({ locationId: undefined })))).status,
    ).toBe(400);
    expect(insertMeetup).not.toHaveBeenCalled();
  });

  it.each([
    ["missing time", { startsAtLocal: undefined }],
    ["time in the past", { startsAtLocal: "2026-11-05T08:00" }],
    ["before 8 AM Central", { startsAtLocal: "2026-11-06T07:59" }],
    ["after 9 PM Central", { startsAtLocal: "2026-11-06T21:01" }],
    ["note over 280 characters", { note: "x".repeat(281) }],
  ])("400 for %s", async (_label, over) => {
    const res = await proposePOST(post("/api/meetups", validBody(over)));
    expect(res.status).toBe(400);
    expect(insertMeetup).not.toHaveBeenCalled();
  });

  it("409 when the pair already has an open proposal", async () => {
    insertMeetup.mockResolvedValue({ ok: false, reason: "open_exists" });
    const res = await proposePOST(post("/api/meetups", validBody()));
    expect(res.status).toBe(409);
  });

  it("429 when rate limited, before any insert", async () => {
    checkRateLimit.mockResolvedValue({ allowed: false });
    const res = await proposePOST(post("/api/meetups", validBody()));
    expect(res.status).toBe(429);
    expect(insertMeetup).not.toHaveBeenCalled();
  });

  it("never logs the note when the insert blows up", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    insertMeetup.mockRejectedValue(new Error(`row failed: ${SECRET_NOTE}`));
    const res = await proposePOST(post("/api/meetups", validBody({ note: SECRET_NOTE })));
    expect(res.status).toBe(500);
    expect(JSON.stringify(spy.mock.calls)).not.toContain(SECRET_NOTE);
    expect(JSON.stringify(await res.json())).not.toContain(SECRET_NOTE);
    spy.mockRestore();
  });
});

describe.each([
  ["accept", acceptPOST, "accepted"],
  ["decline", declinePOST, "declined"],
] as const)("POST /api/meetups/[id]/%s", (_name, handler, status) => {
  it("lets the recipient answer, atomically", async () => {
    getMeetupParties.mockResolvedValue(parties());
    respondToMeetup.mockResolvedValue(meetupDto({ status }));
    const res = await handler(post("/x"), ctxFor());
    expect(res.status).toBe(200);
    expect((await res.json()).meetup.status).toBe(status);
    // Exactly (id, caller, status): there is no reason argument to pass.
    expect(respondToMeetup).toHaveBeenCalledWith(MEETUP_ID, ME, status);
  });

  it("ignores any body, so a decline can never carry a reason", async () => {
    getMeetupParties.mockResolvedValue(parties());
    respondToMeetup.mockResolvedValue(meetupDto({ status }));
    await handler(post("/x", { reason: "too busy" }), ctxFor());
    expect(respondToMeetup.mock.calls[0]).toEqual([MEETUP_ID, ME, status]);
  });

  it("409 for the proposer, without answering", async () => {
    getMeetupParties.mockResolvedValue(parties({ proposerUserId: ME, recipientUserId: THEM }));
    const res = await handler(post("/x"), ctxFor());
    expect(res.status).toBe(409);
    expect(respondToMeetup).not.toHaveBeenCalled();
  });

  it("404 for a non-member, without revealing the meetup", async () => {
    signedIn(STRANGER);
    getMeetupParties.mockResolvedValue(parties());
    const res = await handler(post("/x"), ctxFor());
    expect(res.status).toBe(404);
    expect(respondToMeetup).not.toHaveBeenCalled();
  });

  it("404 for an unknown meetup", async () => {
    getMeetupParties.mockResolvedValue(null);
    expect((await handler(post("/x"), ctxFor())).status).toBe(404);
  });

  it("404 for a meetup in another school, even for a pair member", async () => {
    getMeetupParties.mockResolvedValue(parties({ organizationId: OTHER_ORG }));
    expect((await handler(post("/x"), ctxFor())).status).toBe(404);
    expect(respondToMeetup).not.toHaveBeenCalled();
  });

  it("409 once it has already been answered", async () => {
    for (const s of ["accepted", "declined"]) {
      getMeetupParties.mockResolvedValue(parties({ status: s }));
      expect((await handler(post("/x"), ctxFor())).status).toBe(409);
    }
    expect(respondToMeetup).not.toHaveBeenCalled();
  });

  it("409 when a racing request wins (the atomic update matches no row)", async () => {
    getMeetupParties.mockResolvedValue(parties()); // still 'proposed' when read
    respondToMeetup.mockResolvedValue(null); // but gone by the time we update
    expect((await handler(post("/x"), ctxFor())).status).toBe(409);
  });

  it("is not a way to answer through a non-uuid id", async () => {
    getMeetupParties.mockResolvedValue(null);
    expect((await handler(post("/x"), ctxFor("not-a-uuid"))).status).toBe(404);
  });
});

describe("double accept", () => {
  it("the first accept succeeds and the second is rejected", async () => {
    getMeetupParties.mockResolvedValueOnce(parties()).mockResolvedValueOnce(parties({ status: "accepted" }));
    respondToMeetup.mockResolvedValueOnce(meetupDto({ status: "accepted" }));

    expect((await acceptPOST(post("/x"), ctxFor())).status).toBe(200);
    expect((await acceptPOST(post("/x"), ctxFor())).status).toBe(409);
    expect(respondToMeetup).toHaveBeenCalledTimes(1);
  });

  it("accept after decline is rejected too", async () => {
    getMeetupParties.mockResolvedValue(parties({ status: "declined" }));
    expect((await acceptPOST(post("/x"), ctxFor())).status).toBe(409);
  });
});

describe("emails are scheduled after the response", () => {
  it("proposing sends the 'proposed' email, but only after the response", async () => {
    insertMeetup.mockResolvedValue({ ok: true, meetup: meetupDto() });
    const res = await proposePOST(post("/api/meetups", validBody()));
    expect(res.status).toBe(201);
    // Scheduled, not yet run: the request itself never waits on Resend.
    expect(afterCallbacks).toHaveLength(1);
    expect(sendMeetupEmails).not.toHaveBeenCalled();
    await flushAfter();
    expect(sendMeetupEmails).toHaveBeenCalledWith(MEETUP_ID, "proposed");
  });

  it("accepting sends the 'accepted' email", async () => {
    getMeetupParties.mockResolvedValue(parties());
    respondToMeetup.mockResolvedValue(meetupDto({ status: "accepted" }));
    await acceptPOST(post("/x"), ctxFor());
    await flushAfter();
    expect(sendMeetupEmails).toHaveBeenCalledTimes(1);
    expect(sendMeetupEmails).toHaveBeenCalledWith(MEETUP_ID, "accepted");
  });

  it("declining sends the 'declined' email", async () => {
    getMeetupParties.mockResolvedValue(parties());
    respondToMeetup.mockResolvedValue(meetupDto({ status: "declined" }));
    await declinePOST(post("/x"), ctxFor());
    await flushAfter();
    expect(sendMeetupEmails).toHaveBeenCalledTimes(1);
    expect(sendMeetupEmails).toHaveBeenCalledWith(MEETUP_ID, "declined");
  });

  it("a send problem cannot fail the request", async () => {
    insertMeetup.mockResolvedValue({ ok: true, meetup: meetupDto() });
    sendMeetupEmails.mockRejectedValue(new Error("resend is down"));
    const res = await proposePOST(post("/api/meetups", validBody()));
    expect(res.status).toBe(201);
    await expect(flushAfter()).rejects.toThrow(); // surfaces only in the background callback
    expect((await res.json()).meetup.id).toBe(MEETUP_ID);
  });

  it("sends nothing when the request is rejected", async () => {
    // Unmatched, invalid, duplicate, rate limited.
    isMutualMatch.mockResolvedValueOnce(false);
    await proposePOST(post("/api/meetups", validBody()));
    await proposePOST(post("/api/meetups", validBody({ startsAtLocal: "2020-01-01T10:00" })));
    insertMeetup.mockResolvedValueOnce({ ok: false, reason: "open_exists" });
    await proposePOST(post("/api/meetups", validBody()));
    checkRateLimit.mockResolvedValueOnce({ allowed: false });
    await proposePOST(post("/api/meetups", validBody()));
    expect(afterCallbacks).toHaveLength(0);
  });

  it("sends nothing for a proposer, a stranger, a repeat or a lost race", async () => {
    // Proposer tries to answer.
    getMeetupParties.mockResolvedValueOnce(parties({ proposerUserId: ME, recipientUserId: THEM }));
    await acceptPOST(post("/x"), ctxFor());
    // Stranger.
    signedIn(STRANGER);
    getMeetupParties.mockResolvedValueOnce(parties());
    await declinePOST(post("/x"), ctxFor());
    signedIn(ME);
    // Already answered.
    getMeetupParties.mockResolvedValueOnce(parties({ status: "accepted" }));
    await acceptPOST(post("/x"), ctxFor());
    // Lost the race: the atomic update matched nothing.
    getMeetupParties.mockResolvedValueOnce(parties());
    respondToMeetup.mockResolvedValueOnce(null);
    await acceptPOST(post("/x"), ctxFor());
    expect(afterCallbacks).toHaveLength(0);
  });

  it("a double accept schedules exactly one email", async () => {
    getMeetupParties
      .mockResolvedValueOnce(parties())
      .mockResolvedValueOnce(parties({ status: "accepted" }));
    respondToMeetup.mockResolvedValueOnce(meetupDto({ status: "accepted" }));
    await acceptPOST(post("/x"), ctxFor());
    await acceptPOST(post("/x"), ctxFor());
    expect(afterCallbacks).toHaveLength(1);
  });

  it("sends nothing when the flag is off", async () => {
    vi.stubEnv("MEETUPS_V1_ORGS", "");
    await proposePOST(post("/api/meetups", validBody()));
    await acceptPOST(post("/x"), ctxFor());
    expect(afterCallbacks).toHaveLength(0);
  });
});
