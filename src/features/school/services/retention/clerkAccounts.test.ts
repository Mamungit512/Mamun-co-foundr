import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserList = vi.fn();

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));
vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({ users: { getUserList } }),
}));

import { fetchDomainRecords } from "./clerkAccounts";

const ORG = "org-ut";
const DOMAINS = ["utexas.edu", "eid.utexas.edu", "mccombs.utexas.edu"];

const user = (id: string, email: string, orgId?: string) => ({
  id,
  createdAt: Date.parse("2026-09-01T12:00:00Z"),
  primaryEmailAddressId: "e1",
  emailAddresses: [{ id: "e1", emailAddress: email }],
  publicMetadata: orgId ? { organization_id: orgId } : {},
});

beforeEach(() => getUserList.mockReset());

describe("fetchDomainRecords", () => {
  it("keeps only this school's accounts and never caches full emails", async () => {
    getUserList.mockResolvedValue({
      totalCount: 5,
      data: [
        user("a", "a@utexas.edu"),
        user("b", "b@mccombs.utexas.edu"),
        user("c", "c@notutexas.edu"), // look-alike
        user("d", "d@gmail.com", ORG), // off-domain but claimed by this school
        user("e", "e@gmail.com", "org-other"), // second school
      ],
    });
    const { records } = await fetchDomainRecords(ORG, DOMAINS);
    expect(records.map((r) => r.id).sort()).toEqual(["a", "b", "d"]);
    expect(JSON.stringify(records)).not.toContain("a@utexas.edu");
    expect(records[0].maskedEmail).toBe("a***@utexas.edu");
  });

  it("searches once for the parent domain, oldest first", async () => {
    getUserList.mockResolvedValue({ totalCount: 0, data: [] });
    await fetchDomainRecords(ORG, DOMAINS);
    expect(getUserList).toHaveBeenCalledTimes(1);
    expect(getUserList).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "utexas.edu",
        limit: 500,
        offset: 0,
        orderBy: "+created_at",
      }),
    );
  });

  it("pages through every result", async () => {
    getUserList
      .mockResolvedValueOnce({
        totalCount: 501,
        data: [user("a", "a@utexas.edu")],
      })
      .mockResolvedValueOnce({
        totalCount: 501,
        data: [user("b", "b@utexas.edu")],
      });
    const { records } = await fetchDomainRecords(ORG, DOMAINS);
    expect(getUserList).toHaveBeenCalledTimes(2);
    expect(getUserList.mock.calls[1][0].offset).toBe(500);
    expect(records).toHaveLength(2);
  });

  it("throws on a failed page instead of returning a partial list", async () => {
    getUserList
      .mockResolvedValueOnce({
        totalCount: 501,
        data: [user("a", "a@utexas.edu")],
      })
      .mockRejectedValueOnce(new Error("Clerk is down"));
    await expect(fetchDomainRecords(ORG, DOMAINS)).rejects.toThrow(
      "Clerk is down",
    );
  });
});
