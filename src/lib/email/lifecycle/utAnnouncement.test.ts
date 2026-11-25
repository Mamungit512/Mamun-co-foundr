import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserList = vi.fn();
const sendUtAnnouncementEmail = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({ users: { getUserList } }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: "org-ut" } }),
        }),
      }),
    }),
  }),
}));
vi.mock("../emails/utAnnouncement", () => ({
  UT_ORG_SLUG: "ut",
  UT_ANNOUNCEMENT_CAMPAIGNS_KEY: "utAnnouncementCampaigns",
  sendUtAnnouncementEmail: (...a: unknown[]) => sendUtAnnouncementEmail(...a),
}));

import { runUtAnnouncement } from "./utAnnouncement";

const DAY = 24 * 60 * 60 * 1000;

function user(
  id: string,
  opts: {
    org?: string;
    campaigns?: Record<string, string>;
    legacySentAt?: string;
    lastActiveAt?: number | null;
    email?: string | null;
  } = {},
) {
  const email = opts.email === undefined ? `${id}@utexas.edu` : opts.email;
  return {
    id,
    firstName: id,
    lastActiveAt: opts.lastActiveAt === undefined ? Date.now() : opts.lastActiveAt,
    primaryEmailAddressId: "e1",
    emailAddresses: email ? [{ id: "e1", emailAddress: email }] : [],
    publicMetadata: { organization_id: opts.org ?? "org-ut" },
    privateMetadata: {
      ...(opts.campaigns ? { utAnnouncementCampaigns: opts.campaigns } : {}),
      ...(opts.legacySentAt ? { utAnnouncementSentAt: opts.legacySentAt } : {}),
    },
  };
}

beforeEach(() => {
  getUserList.mockReset();
  sendUtAnnouncementEmail.mockReset();
  sendUtAnnouncementEmail.mockResolvedValue("sent");
});

describe("runUtAnnouncement", () => {
  it("defaults to a dry run: counts eligible UT users, sends nothing", async () => {
    getUserList.mockResolvedValue({
      data: [
        user("a"),
        user("b", { org: "org-other" }),
        user("c", { campaigns: { dec: "2026-12-01T00:00:00Z" } }),
        user("d", { email: null }),
      ],
    });
    const res = await runUtAnnouncement({ campaignId: "dec" });
    expect(res.dryRun).toBe(true);
    expect(res.candidates).toBe(1);
    expect(res.sample).toEqual(["a***@utexas.edu"]);
    expect(sendUtAnnouncementEmail).not.toHaveBeenCalled();
  });

  it("sends to eligible UT users only when dryRun is false", async () => {
    getUserList.mockResolvedValue({
      data: [user("a"), user("b", { org: "org-other" })],
    });
    const res = await runUtAnnouncement({ dryRun: false, campaignId: "dec" });
    expect(sendUtAnnouncementEmail).toHaveBeenCalledTimes(1);
    expect(sendUtAnnouncementEmail).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "a", campaignId: "dec" }),
    );
    expect(res).toMatchObject({ sent: 1, failed: 0, remaining: 0 });
  });

  it("respects limit and reports what remains", async () => {
    getUserList.mockResolvedValue({ data: [user("a"), user("b"), user("c")] });
    const res = await runUtAnnouncement({
      dryRun: false,
      limit: 2,
      campaignId: "dec",
    });
    expect(sendUtAnnouncementEmail).toHaveBeenCalledTimes(2);
    expect(res.candidates).toBe(3);
    expect(res.remaining).toBe(1);
  });

  it("filters by inactiveDays, including never-active users", async () => {
    getUserList.mockResolvedValue({
      data: [
        user("recent", { lastActiveAt: Date.now() - 1 * DAY }),
        user("stale", { lastActiveAt: Date.now() - 30 * DAY }),
        user("never", { lastActiveAt: null }),
      ],
    });
    const res = await runUtAnnouncement({ inactiveDays: 14 });
    expect(res.candidates).toBe(2);
  });

  it("counts failed sends", async () => {
    getUserList.mockResolvedValue({ data: [user("a"), user("b")] });
    sendUtAnnouncementEmail
      .mockResolvedValueOnce("failed")
      .mockResolvedValueOnce("sent");
    const res = await runUtAnnouncement({ dryRun: false, campaignId: "dec" });
    expect(res).toMatchObject({ sent: 1, failed: 1 });
  });

  it("lets a new campaign reach users who received earlier ones", async () => {
    getUserList.mockResolvedValue({
      data: [
        user("got-nov", { campaigns: { nov: "2026-11-09T00:00:00Z" } }),
        user("got-old-flag", { legacySentAt: "2026-11-01T00:00:00Z" }),
        user("got-dec", { campaigns: { dec: "2026-12-01T00:00:00Z" } }),
      ],
    });
    await runUtAnnouncement({ dryRun: false, campaignId: "dec" });
    expect(
      sendUtAnnouncementEmail.mock.calls.map((c) => (c[0] as { userId: string }).userId),
    ).toEqual(["got-nov", "got-old-flag"]);
  });

  it("refuses to send without a campaign id", async () => {
    getUserList.mockResolvedValue({ data: [user("a")] });
    await expect(runUtAnnouncement({ dryRun: false })).rejects.toThrow(
      /campaignId/,
    );
    expect(sendUtAnnouncementEmail).not.toHaveBeenCalled();
  });
});
