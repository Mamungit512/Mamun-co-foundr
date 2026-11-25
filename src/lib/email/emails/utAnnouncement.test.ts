import { beforeEach, describe, expect, it, vi } from "vitest";

const sendTemplateEmail = vi.fn();
const hasCampaignBeenSent = vi.fn();
const markCampaignSent = vi.fn();

vi.mock("../send", () => ({
  sendTemplateEmail: (...a: unknown[]) => sendTemplateEmail(...a),
}));
vi.mock("../idempotency", () => ({
  hasCampaignBeenSent: (...a: unknown[]) => hasCampaignBeenSent(...a),
  markCampaignSent: (...a: unknown[]) => markCampaignSent(...a),
}));

import { sendUtAnnouncementEmail } from "./utAnnouncement";

const user = {
  userId: "u1",
  email: "a@utexas.edu",
  firstName: "Ada",
  campaignId: "2026-12-newsletter",
};

beforeEach(() => {
  for (const fn of [sendTemplateEmail, hasCampaignBeenSent, markCampaignSent]) {
    fn.mockReset();
  }
  hasCampaignBeenSent.mockResolvedValue(false);
  sendTemplateEmail.mockResolvedValue({ ok: true });
});

describe("sendUtAnnouncementEmail", () => {
  it("skips without sending when this campaign is already flagged", async () => {
    hasCampaignBeenSent.mockResolvedValue(true);
    expect(await sendUtAnnouncementEmail(user)).toBe("skipped");
    expect(hasCampaignBeenSent).toHaveBeenCalledWith(
      "u1",
      "utAnnouncementCampaigns",
      "2026-12-newsletter",
    );
    expect(sendTemplateEmail).not.toHaveBeenCalled();
    expect(markCampaignSent).not.toHaveBeenCalled();
  });

  it("sends the UT template with only the first name and marks this campaign sent", async () => {
    expect(await sendUtAnnouncementEmail(user)).toBe("sent");
    expect(sendTemplateEmail).toHaveBeenCalledWith({
      type: "utAnnouncement",
      to: "a@utexas.edu",
      orgSlug: "ut",
      variables: { firstName: "Ada" },
      idempotencyKey: "ut-announcement/2026-12-newsletter/u1",
    });
    expect(markCampaignSent).toHaveBeenCalledWith(
      "u1",
      "utAnnouncementCampaigns",
      "2026-12-newsletter",
    );
  });

  it("falls back to 'there' when there is no first name", async () => {
    await sendUtAnnouncementEmail({ ...user, firstName: null });
    expect(sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ firstName: "there" }),
      }),
    );
  });

  it("does not mark the user sent when the send fails", async () => {
    sendTemplateEmail.mockResolvedValue({ ok: false, reason: "send_error" });
    expect(await sendUtAnnouncementEmail(user)).toBe("failed");
    expect(markCampaignSent).not.toHaveBeenCalled();
  });
});
