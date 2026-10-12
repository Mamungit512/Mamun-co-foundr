import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const requireOrgAdmin = vi.fn();
const getOverview = vi.fn();
const getGhostAccounts = vi.fn();
const getGhostExportRows = vi.fn();
const recordAdminExport = vi.fn();
const getOrgSlug = vi.fn();

vi.mock("@/features/school/auth/org-admin", () => ({
  requireOrgAdmin: () => requireOrgAdmin(),
}));
vi.mock("@/features/school/services/retention", () => ({
  getOverview: (...a: unknown[]) => getOverview(...a),
  getGhostAccounts: (...a: unknown[]) => getGhostAccounts(...a),
  getGhostExportRows: (...a: unknown[]) => getGhostExportRows(...a),
}));
vi.mock("@/features/school/services/retention/exports", () => ({
  recordAdminExport: (...a: unknown[]) => recordAdminExport(...a),
  getOrgSlug: (...a: unknown[]) => getOrgSlug(...a),
}));

import { GET as overviewGET } from "./overview/route";
import { GET as ghostsGET } from "./ghosts/route";
import { GET as exportGET } from "../reports/ghost-accounts/route";

const ADMIN = { userId: "u1", orgId: "org-a", email: "dir@utexas.edu" };
const signedOut = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const notAdmin = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });
const req = (url: string) => new NextRequest(`http://localhost${url}`);

beforeEach(() => {
  for (const fn of [
    requireOrgAdmin,
    getOverview,
    getGhostAccounts,
    getGhostExportRows,
    recordAdminExport,
    getOrgSlug,
  ]) {
    fn.mockReset();
  }
  getOrgSlug.mockResolvedValue("ut");
  getOverview.mockResolvedValue({ ok: true });
  getGhostAccounts.mockResolvedValue({ rows: [], total: 0 });
  getGhostExportRows.mockResolvedValue([
    {
      clerk_user_id: "c1",
      masked_email: "a***@utexas.edu",
      email: "alice@utexas.edu",
      clerk_created_at: "2026-09-01T12:00:00Z",
      days_since_created: 35,
      has_main_site_profile: true,
    },
  ]);
  recordAdminExport.mockResolvedValue(undefined);
});

describe.each([
  ["overview", () => overviewGET()],
  ["ghosts", () => ghostsGET(req("/api/school/retention/ghosts"))],
  ["ghost export", () => exportGET()],
])("%s route access", (_name, call) => {
  it("returns 401 signed out and touches no data", async () => {
    requireOrgAdmin.mockResolvedValue(signedOut());
    expect((await call()).status).toBe(401);
    expect(getOverview).not.toHaveBeenCalled();
    expect(getGhostAccounts).not.toHaveBeenCalled();
    expect(getGhostExportRows).not.toHaveBeenCalled();
    expect(recordAdminExport).not.toHaveBeenCalled();
  });

  it("returns 403 for a non-admin and touches no data", async () => {
    requireOrgAdmin.mockResolvedValue(notAdmin());
    expect((await call()).status).toBe(403);
    expect(getOverview).not.toHaveBeenCalled();
    expect(getGhostAccounts).not.toHaveBeenCalled();
    expect(getGhostExportRows).not.toHaveBeenCalled();
    expect(recordAdminExport).not.toHaveBeenCalled();
  });
});

describe("org comes from the session, never the request", () => {
  beforeEach(() => requireOrgAdmin.mockResolvedValue(ADMIN));

  it("ghost list ignores ?orgId= and ?slug=", async () => {
    await ghostsGET(req("/api/school/retention/ghosts?orgId=org-b&slug=other&page=2"));
    expect(getGhostAccounts).toHaveBeenCalledWith("org-a", 25, 50);
  });

  it("clamps a negative or junk page to the first page", async () => {
    await ghostsGET(req("/api/school/retention/ghosts?page=-4"));
    await ghostsGET(req("/api/school/retention/ghosts?page=abc"));
    expect(getGhostAccounts).toHaveBeenNthCalledWith(1, "org-a", 25, 0);
    expect(getGhostAccounts).toHaveBeenNthCalledWith(2, "org-a", 25, 0);
  });

  it("overview reads the org from the admin check only", async () => {
    await overviewGET();
    expect(getOverview).toHaveBeenCalledWith("org-a");
  });
});

describe("ghost export", () => {
  beforeEach(() => requireOrgAdmin.mockResolvedValue(ADMIN));

  it("records exactly one audit row and names the file from the org slug", async () => {
    const res = await exportGET();
    expect(res.status).toBe(200);
    expect(recordAdminExport).toHaveBeenCalledTimes(1);
    expect(recordAdminExport).toHaveBeenCalledWith({
      orgId: "org-a",
      userId: "u1",
      email: "dir@utexas.edu",
      kind: "ghost-accounts",
      rowCount: 1,
    });
    expect(res.headers.get("Content-Disposition")).toMatch(
      /^attachment; filename="ut-ghost-accounts-\d{4}-\d{2}-\d{2}\.csv"$/,
    );
    const body = await res.text();
    expect(body).toContain("alice@utexas.edu");
    expect(body.split("\r\n")).toHaveLength(2); // header + one ghost
  });

  it("returns 500 and no file when the audit row cannot be written", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    recordAdminExport.mockRejectedValue(new Error("insert failed"));
    const res = await exportGET();
    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(await res.text()).not.toContain("alice@utexas.edu");
  });
});
