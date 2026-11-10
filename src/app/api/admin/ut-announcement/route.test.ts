import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const auth = vi.fn();
const getVerifiedPrimaryEmail = vi.fn();
const getEnvAdminEmails = vi.fn();
const runUtAnnouncement = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({ auth: () => auth() }));
vi.mock("@/features/school/auth/org-admin", () => ({
  getVerifiedPrimaryEmail: (...a: unknown[]) => getVerifiedPrimaryEmail(...a),
  getEnvAdminEmails: () => getEnvAdminEmails(),
}));
vi.mock("@/lib/email/lifecycle", () => ({
  runUtAnnouncement: (...a: unknown[]) => runUtAnnouncement(...a),
}));

import { POST } from "./route";

const post = (body?: unknown) =>
  new NextRequest("http://localhost/api/admin/ut-announcement", {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

beforeEach(() => {
  for (const fn of [
    auth,
    getVerifiedPrimaryEmail,
    getEnvAdminEmails,
    runUtAnnouncement,
  ]) {
    fn.mockReset();
  }
  auth.mockResolvedValue({ userId: "u1" });
  getVerifiedPrimaryEmail.mockResolvedValue("staff@mamuncofoundr.com");
  getEnvAdminEmails.mockReturnValue(["staff@mamuncofoundr.com"]);
  runUtAnnouncement.mockResolvedValue({ candidates: 0, dryRun: true });
});

describe("POST /api/admin/ut-announcement", () => {
  it("returns 401 when signed out", async () => {
    auth.mockResolvedValue({ userId: null });
    expect((await POST(post({}))).status).toBe(401);
    expect(runUtAnnouncement).not.toHaveBeenCalled();
  });

  it("returns 403 when the email has no verified primary", async () => {
    getVerifiedPrimaryEmail.mockResolvedValue(null);
    expect((await POST(post({}))).status).toBe(403);
    expect(runUtAnnouncement).not.toHaveBeenCalled();
  });

  it("returns 403 for an email that is not a platform admin (e.g. UT staff)", async () => {
    getVerifiedPrimaryEmail.mockResolvedValue("director@utexas.edu");
    expect((await POST(post({ dryRun: false }))).status).toBe(403);
    expect(runUtAnnouncement).not.toHaveBeenCalled();
  });

  it("defaults to a dry run with an empty body", async () => {
    const res = await POST(post());
    expect(res.status).toBe(200);
    expect(runUtAnnouncement).toHaveBeenCalledWith({
      dryRun: true,
      limit: undefined,
      inactiveDays: undefined,
    });
  });

  it("only sends when dryRun is explicitly false", async () => {
    await POST(post({ dryRun: "false", limit: 10 }));
    expect(runUtAnnouncement).toHaveBeenLastCalledWith(
      expect.objectContaining({ dryRun: true }),
    );
    await POST(post({ dryRun: false, limit: 10, inactiveDays: 14 }));
    expect(runUtAnnouncement).toHaveBeenLastCalledWith({
      dryRun: false,
      limit: 10,
      inactiveDays: 14,
    });
  });

  it("rejects an invalid limit or inactiveDays", async () => {
    expect((await POST(post({ limit: 0 }))).status).toBe(400);
    expect((await POST(post({ limit: 5000 }))).status).toBe(400);
    expect((await POST(post({ inactiveDays: -1 }))).status).toBe(400);
    expect(runUtAnnouncement).not.toHaveBeenCalled();
  });
});
