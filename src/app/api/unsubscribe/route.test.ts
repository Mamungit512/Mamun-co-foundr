import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const unsubscribeEmail = vi.fn();
vi.mock("@/lib/email/unsubscribe", async (orig) => ({
  ...(await orig<typeof import("@/lib/email/unsubscribe")>()),
  unsubscribeEmail: (...a: unknown[]) => unsubscribeEmail(...a),
}));

import { buildUnsubscribeUrls } from "@/lib/email/unsubscribe";
import { GET, POST } from "./route";

beforeEach(() => {
  process.env.UNSUBSCRIBE_SECRET = "test-secret";
  unsubscribeEmail.mockReset().mockResolvedValue(true);
});

describe("/api/unsubscribe", () => {
  it("POST with a valid signed link unsubscribes that address", async () => {
    const url = buildUnsubscribeUrls("a@utexas.edu")!.oneClickUrl;
    const res = await POST(new NextRequest(url, { method: "POST" }));
    expect(res.status).toBe(200);
    expect(unsubscribeEmail).toHaveBeenCalledWith("a@utexas.edu");
  });

  it("POST with a forged token does nothing", async () => {
    const url = buildUnsubscribeUrls("a@utexas.edu")!.oneClickUrl.replace(/t=[^&]+/, "t=forged");
    const res = await POST(new NextRequest(url, { method: "POST" }));
    expect(res.status).toBe(400);
    expect(unsubscribeEmail).not.toHaveBeenCalled();
  });

  it("GET never unsubscribes; it redirects to the confirm page", async () => {
    const url = buildUnsubscribeUrls("a@utexas.edu")!.oneClickUrl;
    const res = GET(new NextRequest(url));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toMatch(/\/unsubscribe\?e=.+&t=.+/);
    expect(unsubscribeEmail).not.toHaveBeenCalled();
  });
});
