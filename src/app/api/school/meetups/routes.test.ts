import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const requireOrgAdmin = vi.fn();
const getOrgSlugById = vi.fn();
const listLocationsForAdmin = vi.fn();
const createLocation = vi.fn();
const setLocationActive = vi.fn();
const listMeetupsForAdmin = vi.fn();

vi.mock("@/features/school/auth/org-admin", () => ({
  requireOrgAdmin: () => requireOrgAdmin(),
}));
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("@/features/meetups/server/data", () => ({
  getOrgSlugById: (...a: unknown[]) => getOrgSlugById(...a),
  isUuid: () => true,
}));
vi.mock("@/features/meetups/server/adminData", () => ({
  listLocationsForAdmin: (...a: unknown[]) => listLocationsForAdmin(...a),
  createLocation: (...a: unknown[]) => createLocation(...a),
  setLocationActive: (...a: unknown[]) => setLocationActive(...a),
  listMeetupsForAdmin: (...a: unknown[]) => listMeetupsForAdmin(...a),
}));

import * as locationsRoute from "../meetup-locations/route";
import * as locationRoute from "../meetup-locations/[id]/route";
import { GET as meetupsGET } from "./route";

// Synthetic ids only.
const ADMIN = { userId: "user_admin", orgId: "org-ut", email: "director@synthetic.test" };
const LOC_ID = "22222222-2222-4222-8222-222222222222";
const patchCtx = (id = LOC_ID) => ({ params: Promise.resolve({ id }) });

const json = (url: string, method: string, body?: unknown) =>
  new NextRequest(`http://localhost${url}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const location = (over: Record<string, unknown> = {}) => ({
  id: LOC_ID,
  name: "Synthetic Lounge",
  building: null,
  isActive: true,
  createdAt: "2026-11-05T15:00:00.000Z",
  ...over,
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("MEETUPS_V1_ORGS", "ut");
  requireOrgAdmin.mockResolvedValue(ADMIN);
  getOrgSlugById.mockResolvedValue("ut");
});

const ENDPOINTS: [string, () => Promise<Response>][] = [
  ["GET /meetup-locations", () => locationsRoute.GET()],
  ["POST /meetup-locations", () => locationsRoute.POST(json("/x", "POST", { name: "A" }))],
  ["PATCH /meetup-locations/[id]", () => locationRoute.PATCH(json("/x", "PATCH", { isActive: false }), patchCtx())],
  ["GET /meetups", () => meetupsGET()],
];

describe.each(ENDPOINTS)("%s access", (_name, call) => {
  it("401 when signed out", async () => {
    requireOrgAdmin.mockResolvedValue(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    expect((await call()).status).toBe(401);
  });

  it("403 for a signed-in user who is not an admin", async () => {
    requireOrgAdmin.mockResolvedValue(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
    expect((await call()).status).toBe(403);
  });

  it("a non-admin gets 403 even when the flag is off (learns nothing about it)", async () => {
    vi.stubEnv("MEETUPS_V1_ORGS", "");
    requireOrgAdmin.mockResolvedValue(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
    expect((await call()).status).toBe(403);
  });

  it("404 for an admin when the flag is off", async () => {
    vi.stubEnv("MEETUPS_V1_ORGS", "");
    expect((await call()).status).toBe(404);
  });

  it("404 for an admin whose school has no flag, even if another school does", async () => {
    vi.stubEnv("MEETUPS_V1_ORGS", "asu");
    expect((await call()).status).toBe(404);
  });

  it("does no data work when the flag is off", async () => {
    vi.stubEnv("MEETUPS_V1_ORGS", "");
    await call();
    expect(listLocationsForAdmin).not.toHaveBeenCalled();
    expect(createLocation).not.toHaveBeenCalled();
    expect(setLocationActive).not.toHaveBeenCalled();
    expect(listMeetupsForAdmin).not.toHaveBeenCalled();
  });
});

describe("GET /api/school/meetup-locations", () => {
  it("lists the admin's own school only, hidden spots included", async () => {
    listLocationsForAdmin.mockResolvedValue([location(), location({ id: "x", isActive: false })]);
    const res = await locationsRoute.GET();
    expect(res.status).toBe(200);
    expect((await res.json()).locations).toHaveLength(2);
    expect(listLocationsForAdmin).toHaveBeenCalledWith("org-ut");
  });
});

describe("POST /api/school/meetup-locations", () => {
  it("adds a spot to the admin's own school: 201", async () => {
    createLocation.mockResolvedValue({ ok: true, location: location() });
    const res = await locationsRoute.POST(
      json("/x", "POST", { name: "  Synthetic Lounge ", building: "Synthetic Hall" }),
    );
    expect(res.status).toBe(201);
    expect(createLocation).toHaveBeenCalledWith("org-ut", {
      name: "Synthetic Lounge",
      building: "Synthetic Hall",
    });
  });

  it("ignores any organization id in the body", async () => {
    createLocation.mockResolvedValue({ ok: true, location: location() });
    await locationsRoute.POST(
      json("/x", "POST", { name: "A", organization_id: "org-other", organizationId: "org-other" }),
    );
    expect(createLocation.mock.calls[0][0]).toBe("org-ut");
  });

  it("400 with field errors for a bad name or building", async () => {
    for (const body of [{}, { name: "" }, { name: "x".repeat(121) }, { name: "A", building: "x".repeat(161) }]) {
      const res = await locationsRoute.POST(json("/x", "POST", body));
      expect(res.status).toBe(400);
      expect((await res.json()).fields).toBeDefined();
    }
    expect(createLocation).not.toHaveBeenCalled();
  });

  it("400 for an unreadable body", async () => {
    expect((await locationsRoute.POST(new NextRequest("http://localhost/x", { method: "POST", body: "{nope" }))).status).toBe(400);
  });

  it("409 for a duplicate name", async () => {
    createLocation.mockResolvedValue({ ok: false, reason: "duplicate" });
    expect((await locationsRoute.POST(json("/x", "POST", { name: "Synthetic Lounge" }))).status).toBe(409);
  });
});

describe("PATCH /api/school/meetup-locations/[id]", () => {
  it("switches a spot off, live: 200 with the new state", async () => {
    setLocationActive.mockResolvedValue({ ok: true, location: location({ isActive: false }) });
    const res = await locationRoute.PATCH(json("/x", "PATCH", { isActive: false }), patchCtx());
    expect(res.status).toBe(200);
    expect((await res.json()).location.isActive).toBe(false);
    expect(setLocationActive).toHaveBeenCalledWith("org-ut", LOC_ID, false);
  });

  it("switches a spot back on", async () => {
    setLocationActive.mockResolvedValue({ ok: true, location: location({ isActive: true }) });
    await locationRoute.PATCH(json("/x", "PATCH", { isActive: true }), patchCtx());
    expect(setLocationActive).toHaveBeenCalledWith("org-ut", LOC_ID, true);
  });

  it("403 for another school's admin touching this school's spot", async () => {
    // The data layer found the spot but it belongs to a different school.
    setLocationActive.mockResolvedValue({ ok: false, reason: "forbidden" });
    expect((await locationRoute.PATCH(json("/x", "PATCH", { isActive: false }), patchCtx())).status).toBe(403);
    // And it was asked on behalf of the caller's school, not the spot's.
    expect(setLocationActive.mock.calls[0][0]).toBe("org-ut");
  });

  it("404 for an unknown spot", async () => {
    setLocationActive.mockResolvedValue({ ok: false, reason: "not_found" });
    expect((await locationRoute.PATCH(json("/x", "PATCH", { isActive: false }), patchCtx())).status).toBe(404);
  });

  it("400 unless isActive is a boolean", async () => {
    for (const body of [{}, { isActive: "false" }, { isActive: 0 }, { isActive: null }, { name: "Renamed" }]) {
      expect((await locationRoute.PATCH(json("/x", "PATCH", body), patchCtx())).status).toBe(400);
    }
    expect(setLocationActive).not.toHaveBeenCalled();
  });

  it("only ever toggles: no name or building edit goes through", async () => {
    setLocationActive.mockResolvedValue({ ok: true, location: location() });
    await locationRoute.PATCH(json("/x", "PATCH", { isActive: true, name: "Hijack", building: "Hijack" }), patchCtx());
    expect(setLocationActive.mock.calls[0]).toEqual(["org-ut", LOC_ID, true]);
  });

  it("has no DELETE handler: spots are never hard-deleted", () => {
    expect("DELETE" in locationRoute).toBe(false);
    expect("DELETE" in locationsRoute).toBe(false);
  });
});

describe("GET /api/school/meetups", () => {
  const row = {
    id: "m1",
    status: "accepted",
    proposerName: "Hannah Baker",
    recipientName: "Ethan Cole",
    startsAt: "2026-10-20T21:00:00.000Z",
    createdAt: "2026-10-19T15:00:00.000Z",
    respondedAt: "2026-10-19T16:00:00.000Z",
    location: { name: "Synthetic Lounge", isActive: false },
  };

  it("returns the admin's school's meetups: pair, spot, time, status", async () => {
    listMeetupsForAdmin.mockResolvedValue([row]);
    const res = await meetupsGET();
    expect(res.status).toBe(200);
    expect((await res.json()).meetups).toEqual([row]);
    expect(listMeetupsForAdmin).toHaveBeenCalledWith("org-ut");
  });

  it("a hidden spot is still named on a past meetup", async () => {
    listMeetupsForAdmin.mockResolvedValue([row]);
    const json = await (await meetupsGET()).json();
    expect(json.meetups[0].location).toEqual({ name: "Synthetic Lounge", isActive: false });
  });

  it("exposes no note, address or user id", async () => {
    listMeetupsForAdmin.mockResolvedValue([row]);
    const text = JSON.stringify(await (await meetupsGET()).json());
    for (const forbidden of ["note", "email", "user_", "_user_id", "email_sent_at"]) {
      expect(text).not.toContain(forbidden);
    }
  });
});
