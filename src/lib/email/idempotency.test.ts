import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const updateUserMetadata = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({ users: { getUser, updateUserMetadata } }),
}));

import {
  getCampaignSentAt,
  hasCampaignBeenSent,
  markCampaignSent,
} from "./idempotency";

beforeEach(() => {
  getUser.mockReset();
  updateUserMetadata.mockReset();
});

describe("campaign idempotency", () => {
  it("reads a campaign's sent-at from the per-campaign map", () => {
    const meta = { utAnnouncementCampaigns: { nov: "2026-11-09T00:00:00Z" } };
    expect(getCampaignSentAt(meta, "utAnnouncementCampaigns", "nov")).toBe(
      "2026-11-09T00:00:00Z",
    );
    expect(getCampaignSentAt(meta, "utAnnouncementCampaigns", "dec")).toBeNull();
    expect(getCampaignSentAt({}, "utAnnouncementCampaigns", "nov")).toBeNull();
    expect(getCampaignSentAt(undefined, "utAnnouncementCampaigns", "nov")).toBeNull();
  });

  it("keeps earlier campaigns when marking a new one", async () => {
    getUser.mockResolvedValue({
      privateMetadata: {
        utAnnouncementCampaigns: { nov: "2026-11-09T00:00:00Z" },
      },
    });
    await markCampaignSent("u1", "utAnnouncementCampaigns", "dec");
    const [, { privateMetadata }] = updateUserMetadata.mock.calls[0];
    expect(privateMetadata.utAnnouncementCampaigns).toEqual({
      nov: "2026-11-09T00:00:00Z",
      dec: expect.any(String),
    });
  });

  it("fails closed when Clerk cannot be read", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    getUser.mockRejectedValue(new Error("down"));
    expect(await hasCampaignBeenSent("u1", "utAnnouncementCampaigns", "dec")).toBe(
      true,
    );
    err.mockRestore();
  });
});
