import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
const isEmailUnsubscribed = vi.fn();

vi.mock("./client", () => ({
  getResendClient: () => ({ emails: { create: (...a: unknown[]) => create(...a) } }),
  EMAIL_FROM: "Mamun Co-Foundr <mamun@mamuncofoundr.com>",
}));
vi.mock("./unsubscribe", async (orig) => ({
  ...(await orig<typeof import("./unsubscribe")>()),
  isEmailUnsubscribed: (...a: unknown[]) => isEmailUnsubscribed(...a),
}));

import { sendTemplateEmail } from "./send";

beforeEach(() => {
  process.env.UNSUBSCRIBE_SECRET = "test-secret";
  create.mockReset().mockResolvedValue({ data: { id: "e1" } });
  isEmailUnsubscribed.mockReset().mockResolvedValue(false);
});

describe("sendTemplateEmail unsubscribe handling", () => {
  it("does not send to an address that unsubscribed", async () => {
    isEmailUnsubscribed.mockResolvedValue(true);
    const res = await sendTemplateEmail({
      type: "reEngagement",
      to: "a@utexas.edu",
      orgSlug: "ut",
      variables: { firstName: "Ada" },
    });
    expect(res).toEqual({ ok: false, reason: "unsubscribed" });
    expect(create).not.toHaveBeenCalled();
  });

  it("adds the per-recipient unsubscribe link and one-click headers", async () => {
    await sendTemplateEmail({
      type: "reEngagement",
      to: "a@utexas.edu",
      orgSlug: "ut",
      variables: { firstName: "Ada" },
    });
    const payload = create.mock.calls[0][0];
    expect(payload.template.variables.firstName).toBe("Ada");
    expect(payload.template.variables.unsubscribeUrl).toMatch(
      /^https:\/\/mamuncofoundr\.com\/unsubscribe\?e=.+&t=.+$/,
    );
    expect(payload.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(payload.headers["List-Unsubscribe"]).toMatch(
      /^<https:\/\/mamuncofoundr\.com\/api\/unsubscribe\?e=.+>, <mailto:mamun@mamuncofoundr\.com\?subject=Unsubscribe>$/,
    );
  });

  it("gives the UT newsletter the same per-recipient unsubscribe link", async () => {
    await sendTemplateEmail({
      type: "utAnnouncement",
      to: "a@utexas.edu",
      orgSlug: "ut",
      variables: { firstName: "Ada" },
    });
    const payload = create.mock.calls[0][0];
    expect(payload.template.variables).toEqual({
      firstName: "Ada",
      unsubscribeUrl: expect.stringMatching(
        /^https:\/\/mamuncofoundr\.com\/unsubscribe\?e=.+&t=.+$/,
      ),
    });
    expect(payload.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });

  it("falls back to the mailto link with no signing secret", async () => {
    delete process.env.UNSUBSCRIBE_SECRET;
    delete process.env.CRON_SECRET;
    await sendTemplateEmail({
      type: "welcome",
      to: "a@utexas.edu",
      orgSlug: "ut",
      variables: { firstName: "Ada" } as never,
    });
    const payload = create.mock.calls[0][0];
    expect(payload.template.variables.unsubscribeUrl).toBe(
      "mailto:mamun@mamuncofoundr.com?subject=Unsubscribe",
    );
    expect(payload.headers).toBeUndefined();
  });
});
