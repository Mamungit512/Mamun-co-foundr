import { beforeEach, describe, expect, it, vi } from "vitest";

const sendTemplateEmail = vi.fn();
vi.mock("../send", () => ({
  sendTemplateEmail: (...a: unknown[]) => sendTemplateEmail(...a),
}));

import { getOrgAppUrl } from "../client";
import { sendCofounderInviteEmail, sendCofounderLinkedEmail } from "./cofounderInvite";

beforeEach(() => {
  sendTemplateEmail.mockReset().mockResolvedValue({ ok: true });
});

describe("school email links", () => {
  it("uses the school's subdomain", () => {
    expect(getOrgAppUrl("ut")).toBe("https://ut.mamuncofoundr.com");
  });

  it("invite and linked buttons open ut.mamuncofoundr.com", async () => {
    await sendCofounderInviteEmail({ to: "a@utexas.edu", inviterName: "Ada", slug: "ut", token: "tok" });
    await sendCofounderLinkedEmail({ to: "a@utexas.edu", linkedName: "Ada", slug: "ut" });
    expect(sendTemplateEmail.mock.calls[0][0].variables.acceptUrl).toBe(
      "https://ut.mamuncofoundr.com/invite/tok",
    );
    expect(sendTemplateEmail.mock.calls[1][0].variables.dashboardUrl).toBe(
      "https://ut.mamuncofoundr.com/dashboard",
    );
  });
});
