import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const calls: string[] = [];
const backfillUserOrganizations = vi.fn();
const runProfileCompletionReminders = vi.fn();
const runReEngagementReminders = vi.fn();

vi.mock("@/lib/cronAuth", () => ({ verifyCronSecret: () => null }));
vi.mock("@/features/school/services/orgLink", () => ({
  backfillUserOrganizations: () => backfillUserOrganizations(),
}));
vi.mock("@/lib/email/lifecycle", () => ({
  runProfileCompletionReminders: () => runProfileCompletionReminders(),
  runReEngagementReminders: () => runReEngagementReminders(),
}));

import { GET } from "./route";

const req = () => new NextRequest("http://localhost/api/cron/lifecycle-emails");
const result = (name: string) => ({
  name,
  candidates: 0,
  sent: 0,
  skipped: 0,
  failed: 0,
});

beforeEach(() => {
  calls.length = 0;
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  backfillUserOrganizations.mockReset().mockImplementation(async () => {
    calls.push("backfill");
    return { linked: 2 };
  });
  runProfileCompletionReminders.mockReset().mockImplementation(async () => {
    calls.push("profileReminder");
    return result("profileCompletionReminder");
  });
  runReEngagementReminders.mockReset().mockImplementation(async () => {
    calls.push("reEngagement");
    return result("reEngagement");
  });
});

describe("GET /api/cron/lifecycle-emails", () => {
  it("links users to their school before running the reminder checks", async () => {
    const res = await GET(req());
    expect(calls).toEqual(["backfill", "profileReminder", "reEngagement"]);
    expect((await res.json()).orgBackfill).toEqual({ linked: 2 });
  });

  it("still runs the reminders when the backfill fails", async () => {
    backfillUserOrganizations.mockRejectedValue(new Error("clerk down"));
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect(runProfileCompletionReminders).toHaveBeenCalled();
    expect(runReEngagementReminders).toHaveBeenCalled();
    expect((await res.json()).orgBackfill).toBeNull();
  });
});
