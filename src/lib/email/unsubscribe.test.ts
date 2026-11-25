import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getUserList = vi.fn();
const updateUserMetadata = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({
    users: {
      getUserList: (...a: unknown[]) => getUserList(...a),
      updateUserMetadata: (...a: unknown[]) => updateUserMetadata(...a),
    },
  }),
}));

import {
  buildUnsubscribeUrls,
  decodeEmail,
  encodeEmail,
  isEmailUnsubscribed,
  readUnsubscribeParams,
  signEmail,
  unsubscribeEmail,
  verifyEmailToken,
} from "./unsubscribe";

const fetchMock = vi.fn();

beforeEach(() => {
  process.env.UNSUBSCRIBE_SECRET = "test-secret";
  process.env.RESEND_API_KEY = "re_test";
  getUserList.mockReset();
  updateUserMetadata.mockReset();
  fetchMock.mockReset().mockResolvedValue({ ok: true, status: 200 });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  delete process.env.UNSUBSCRIBE_SECRET;
  delete process.env.CRON_SECRET;
  vi.unstubAllGlobals();
});

describe("signed unsubscribe links", () => {
  it("verifies its own token, case-insensitively, and rejects others", () => {
    const token = signEmail("Student@UTexas.edu")!;
    expect(verifyEmailToken("student@utexas.edu", token)).toBe(true);
    expect(verifyEmailToken("other@utexas.edu", token)).toBe(false);
    expect(verifyEmailToken("student@utexas.edu", "forged")).toBe(false);
  });

  it("falls back to CRON_SECRET and returns null with no secret", () => {
    delete process.env.UNSUBSCRIBE_SECRET;
    expect(signEmail("a@utexas.edu")).toBeNull();
    expect(buildUnsubscribeUrls("a@utexas.edu")).toBeNull();
    process.env.CRON_SECRET = "cron";
    expect(signEmail("a@utexas.edu")).not.toBeNull();
  });

  it("round-trips the email through the link", () => {
    expect(decodeEmail(encodeEmail("a.b@eid.utexas.edu"))).toBe("a.b@eid.utexas.edu");
    expect(decodeEmail("not-an-email")).toBeNull();
    const urls = buildUnsubscribeUrls("a@utexas.edu")!;
    expect(urls.pageUrl.startsWith("https://mamuncofoundr.com/unsubscribe?e=")).toBe(true);
    expect(urls.oneClickUrl.startsWith("https://mamuncofoundr.com/api/unsubscribe?e=")).toBe(true);
    const q = new URL(urls.pageUrl).searchParams;
    expect(readUnsubscribeParams(q.get("e"), q.get("t"))).toBe("a@utexas.edu");
    expect(readUnsubscribeParams(q.get("e"), "bad")).toBeNull();
    expect(readUnsubscribeParams(null, q.get("t"))).toBeNull();
  });
});

describe("opt-out state", () => {
  it("reports unsubscribed only when a matching user has the flag", async () => {
    getUserList.mockResolvedValue({ data: [{ privateMetadata: {} }] });
    expect(await isEmailUnsubscribed("a@utexas.edu")).toBe(false);
    getUserList.mockResolvedValue({
      data: [{ privateMetadata: { emailUnsubscribedAt: "2026-11-25T00:00:00Z" } }],
    });
    expect(await isEmailUnsubscribed("a@utexas.edu")).toBe(true);
  });

  it("fails open when Clerk is unreachable", async () => {
    getUserList.mockRejectedValue(new Error("down"));
    expect(await isEmailUnsubscribed("a@utexas.edu")).toBe(false);
  });

  it("flags every matching user and suppresses the address in Resend", async () => {
    getUserList.mockResolvedValue({ data: [{ id: "u1", privateMetadata: {} }] });
    expect(await unsubscribeEmail("A@UTexas.edu")).toBe(true);
    expect(getUserList).toHaveBeenCalledWith({ emailAddress: ["a@utexas.edu"] });
    expect(updateUserMetadata).toHaveBeenCalledWith("u1", {
      privateMetadata: { emailUnsubscribedAt: expect.any(String) },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/suppressions",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ email: "a@utexas.edu" }) }),
    );
  });

  it("is idempotent and still succeeds with no Clerk user (Resend only)", async () => {
    getUserList.mockResolvedValue({
      data: [{ id: "u1", privateMetadata: { emailUnsubscribedAt: "x" } }],
    });
    expect(await unsubscribeEmail("a@utexas.edu")).toBe(true);
    expect(updateUserMetadata).not.toHaveBeenCalled();

    getUserList.mockResolvedValue({ data: [] });
    expect(await unsubscribeEmail("staff@mamuncofoundr.com")).toBe(true);
  });

  it("returns false when nothing could record the opt-out", async () => {
    getUserList.mockResolvedValue({ data: [] });
    fetchMock.mockResolvedValue({ ok: false, status: 403 });
    expect(await unsubscribeEmail("a@utexas.edu")).toBe(false);
  });
});
