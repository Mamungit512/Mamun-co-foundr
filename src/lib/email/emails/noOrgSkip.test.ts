import { beforeEach, describe, expect, it, vi } from "vitest";

const sendTemplateEmail = vi.fn();
const hasEmailBeenSent = vi.fn();
const hasEmailBeenSentWithinDays = vi.fn();
const markEmailSent = vi.fn();

vi.mock("../send", () => ({
  sendTemplateEmail: (...a: unknown[]) => sendTemplateEmail(...a),
}));
vi.mock("../idempotency", () => ({
  hasEmailBeenSent: (...a: unknown[]) => hasEmailBeenSent(...a),
  hasEmailBeenSentWithinDays: (...a: unknown[]) =>
    hasEmailBeenSentWithinDays(...a),
  markEmailSent: (...a: unknown[]) => markEmailSent(...a),
}));

import { sendProfileReminderEmail } from "./profileReminder";
import { sendReEngagementEmail } from "./reEngagement";
import { sendWeeklyProfileViewsEmail } from "./weeklyProfileViews";
import { sendWelcomeEmail } from "./welcome";

const base = { userId: "u1", email: "a@gmail.com", firstName: "Ada" };

beforeEach(() => {
  for (const fn of [
    sendTemplateEmail,
    hasEmailBeenSent,
    hasEmailBeenSentWithinDays,
    markEmailSent,
  ]) {
    fn.mockReset();
  }
  hasEmailBeenSent.mockResolvedValue(false);
  hasEmailBeenSentWithinDays.mockResolvedValue(false);
  sendTemplateEmail.mockResolvedValue({ ok: true });
});

const cases = [
  ["profileReminder", (orgSlug: string | null) => sendProfileReminderEmail({ ...base, orgSlug })],
  ["reEngagement", (orgSlug: string | null) => sendReEngagementEmail({ ...base, orgSlug })],
  [
    "weeklyProfileViews",
    (orgSlug: string | null) =>
      sendWeeklyProfileViewsEmail({ ...base, viewCount: 3, orgSlug }),
  ],
] as const;

describe.each(cases)("%s without an org", (type, send) => {
  it("skips without calling Resend or marking the user sent", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(await send(null)).toBe("skipped");
    expect(sendTemplateEmail).not.toHaveBeenCalled();
    expect(markEmailSent).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining(`${type} skipped: no org`),
    );
    log.mockRestore();
  });

  it("still sends the school template when the user has an org", async () => {
    expect(await send("ut")).toBe("sent");
    expect(sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({ type, orgSlug: "ut" }),
    );
    expect(markEmailSent).toHaveBeenCalledWith("u1", type);
  });
});

describe("sendWelcomeEmail", () => {
  it("skips without calling Resend when orgSlug is null", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await sendWelcomeEmail({ userId: "u1", email: "a@gmail.com", orgSlug: null });
    expect(sendTemplateEmail).not.toHaveBeenCalled();
    expect(markEmailSent).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("welcome skipped: no org"),
    );
    log.mockRestore();
  });

  it("sends the school welcome when orgSlug is set", async () => {
    await sendWelcomeEmail({ userId: "u1", email: "a@utexas.edu", orgSlug: "ut" });
    expect(sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({ type: "welcome", orgSlug: "ut" }),
    );
  });
});
