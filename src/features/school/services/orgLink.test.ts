import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getUserList = vi.fn();
const updateUserMetadata = vi.fn();
let orgRows: unknown[] = [];

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({ users: { getUserList, updateUserMetadata } }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        not: async () => ({ data: orgRows }),
        contains: async () => ({ data: orgRows }),
      }),
    }),
  }),
}));

import {
  backfillUserOrganizations,
  resolveOrgForEmail,
  type LinkableOrg,
} from "./orgLink";

const UT: LinkableOrg = {
  id: "org-ut",
  slug: "ut",
  ferpa_dpa_signed_at: "2026-06-01T00:00:00Z",
  allowed_email_domains: ["utexas.edu", "eid.utexas.edu"],
};
const UNSIGNED: LinkableOrg = {
  id: "org-x",
  slug: "x",
  ferpa_dpa_signed_at: null,
  allowed_email_domains: ["x.edu"],
};

function user(id: string, email: string | null, orgId?: string) {
  return {
    id,
    firstName: "Secret",
    primaryEmailAddressId: "e1",
    emailAddresses: email ? [{ id: "e1", emailAddress: email }] : [],
    publicMetadata: orgId ? { organization_id: orgId } : {},
  };
}

describe("resolveOrgForEmail", () => {
  it("assigns when the domain is allowed and the DPA is signed", () => {
    expect(resolveOrgForEmail("a@UTexas.edu", [UT, UNSIGNED])).toEqual({
      status: "assign",
      domain: "utexas.edu",
      org: UT,
    });
  });

  it("does not assign when the org has not signed the DPA", () => {
    expect(resolveOrgForEmail("a@x.edu", [UT, UNSIGNED])).toMatchObject({
      status: "unsigned",
      org: UNSIGNED,
    });
  });

  it("returns none for unknown domains and malformed emails", () => {
    expect(resolveOrgForEmail("a@gmail.com", [UT])).toEqual({
      status: "none",
      domain: "gmail.com",
      org: null,
    });
    expect(resolveOrgForEmail("not-an-email", [UT]).status).toBe("none");
  });

  it("never matches an org with an empty allow-list", () => {
    const open = { ...UT, allowed_email_domains: [] };
    expect(resolveOrgForEmail("a@utexas.edu", [open]).status).toBe("none");
  });
});

describe("backfillUserOrganizations", () => {
  let log: ReturnType<typeof vi.spyOn>;
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    getUserList.mockReset();
    updateUserMetadata.mockReset();
    updateUserMetadata.mockResolvedValue({});
    orgRows = [UT, UNSIGNED];
    log = vi.spyOn(console, "log").mockImplementation(() => {});
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    log.mockRestore();
    warn.mockRestore();
  });

  it("links only unlinked users whose domain belongs to a signed org", async () => {
    getUserList.mockResolvedValue({
      data: [
        user("linked", "a@utexas.edu", "org-ut"),
        user("new-ut", "b@utexas.edu"),
        user("new-eid", "c@eid.utexas.edu"),
        user("unsigned", "d@x.edu"),
        user("gmail", "e@gmail.com"),
        user("no-email", null),
      ],
    });

    const res = await backfillUserOrganizations();

    expect(updateUserMetadata.mock.calls).toEqual([
      ["new-ut", { publicMetadata: { organization_id: "org-ut" } }],
      ["new-eid", { publicMetadata: { organization_id: "org-ut" } }],
    ]);
    expect(res).toMatchObject({
      scanned: 6,
      alreadyLinked: 1,
      linked: 2,
      failed: 0,
      unsignedOrg: 1,
      noMatch: 2,
      unmatchedUtDomains: [],
    });
  });

  it("is idempotent: a second run over linked users changes nothing", async () => {
    getUserList.mockResolvedValue({
      data: [user("a", "a@utexas.edu", "org-ut")],
    });
    const res = await backfillUserOrganizations();
    expect(updateUserMetadata).not.toHaveBeenCalled();
    expect(res.linked).toBe(0);
  });

  it("reports UT-looking domains that match no org, without logging emails or names", async () => {
    getUserList.mockResolvedValue({
      data: [
        user("a", "alice@my.utexas.edu"),
        user("b", "bob@my.utexas.edu"),
        user("c", "carol@austin.utexas.edu"),
      ],
    });
    const res = await backfillUserOrganizations();
    expect(res.unmatchedUtDomains).toEqual([
      "austin.utexas.edu",
      "my.utexas.edu",
    ]);

    const logged = [...log.mock.calls, ...warn.mock.calls].flat().join("\n");
    expect(logged).toContain("my.utexas.edu");
    for (const secret of ["alice", "bob", "carol", "Secret"]) {
      expect(logged).not.toContain(secret);
    }
  });

  it("pages through all users", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) =>
      user(`u${i}`, `u${i}@gmail.com`),
    );
    getUserList
      .mockResolvedValueOnce({ data: page1 })
      .mockResolvedValueOnce({ data: [user("late", "z@utexas.edu")] });
    const res = await backfillUserOrganizations();
    expect(getUserList).toHaveBeenCalledTimes(2);
    expect(getUserList.mock.calls[1][0]).toMatchObject({ offset: 100 });
    expect(res.linked).toBe(1);
  });

  it("counts a failed Clerk update and keeps going", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    getUserList.mockResolvedValue({
      data: [user("a", "a@utexas.edu"), user("b", "b@utexas.edu")],
    });
    updateUserMetadata.mockRejectedValueOnce(new Error("rate limited"));
    const res = await backfillUserOrganizations();
    expect(res).toMatchObject({ linked: 1, failed: 1 });
    err.mockRestore();
  });
});
