import { beforeEach, describe, expect, it, vi } from "vitest";

const sendTemplateEmail = vi.fn();
const hasEmailBeenSent = vi.fn();
const markEmailSent = vi.fn();

vi.mock("../send", () => ({
  sendTemplateEmail: (...a: unknown[]) => sendTemplateEmail(...a),
}));
vi.mock("../idempotency", () => ({
  hasEmailBeenSent: (...a: unknown[]) => hasEmailBeenSent(...a),
  markEmailSent: (...a: unknown[]) => markEmailSent(...a),
}));

import { sendUtAnnouncementEmail } from "./utAnnouncement";

const user = { userId: "u1", email: "a@utexas.edu", firstName: "Ada" };

beforeEach(() => {
  for (const fn of [sendTemplateEmail, hasEmailBeenSent, markEmailSent]) {
    fn.mockReset();
  }
  hasEmailBeenSent.mockResolvedValue(false);
  sendTemplateEmail.mockResolvedValue({ ok: true });
});

describe("sendUtAnnouncementEmail", () => {
  it("skips without sending when already flagged", async () => {
    hasEmailBeenSent.mockResolvedValue(true);
    expect(await sendUtAnnouncementEmail(user)).toBe("skipped");
    expect(sendTemplateEmail).not.toHaveBeenCalled();
    expect(markEmailSent).not.toHaveBeenCalled();
  });

  it("sends the UT template with only the first name and marks the user sent", async () => {
    expect(await sendUtAnnouncementEmail(user)).toBe("sent");
    expect(sendTemplateEmail).toHaveBeenCalledWith({
      type: "utAnnouncement",
      to: "a@utexas.edu",
      orgSlug: "ut",
      variables: { firstName: "Ada" },
    });
    expect(markEmailSent).toHaveBeenCalledWith("u1", "utAnnouncement");
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
    expect(markEmailSent).not.toHaveBeenCalled();
  });
});
