import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
const getUser = vi.fn();
const single = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => auth(),
  clerkClient: async () => ({ users: { getUser } }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ single }) }) }),
  }),
}));

import { requireOrgAdmin } from "./org-admin";

const verifiedUser = (email: string) => ({
  primaryEmailAddressId: "e1",
  emailAddresses: [
    { id: "e1", emailAddress: email, verification: { status: "verified" } },
  ],
});

beforeEach(() => {
  auth.mockReset();
  getUser.mockReset();
  single.mockReset();
  delete process.env.ADMIN_EMAILS;
});

describe("requireOrgAdmin", () => {
  it("returns 401 when signed out", async () => {
    auth.mockResolvedValue({ userId: null, sessionClaims: null });
    const res = await requireOrgAdmin();
    expect(res instanceof Response && res.status).toBe(401);
  });

  it("returns 403 when the session names no school", async () => {
    auth.mockResolvedValue({ userId: "u1", sessionClaims: { metadata: {} } });
    const res = await requireOrgAdmin();
    expect(res instanceof Response && res.status).toBe(403);
  });

  it("returns 403 for a student of the school who is not on its admin list", async () => {
    auth.mockResolvedValue({
      userId: "u1",
      sessionClaims: { metadata: { organization_id: "org-b" } },
    });
    getUser.mockResolvedValue(verifiedUser("student@utexas.edu"));
    single.mockResolvedValue({ data: { settings: { admin_emails: ["dir@utexas.edu"] } } });
    const res = await requireOrgAdmin();
    expect(res instanceof Response && res.status).toBe(403);
  });

  it("returns the org from the session claim for an admin", async () => {
    auth.mockResolvedValue({
      userId: "u1",
      sessionClaims: { metadata: { organization_id: "org-b" } },
    });
    getUser.mockResolvedValue(verifiedUser("Dir@utexas.edu"));
    single.mockResolvedValue({ data: { settings: { admin_emails: ["dir@utexas.edu"] } } });
    const res = await requireOrgAdmin();
    expect(res).toEqual({ userId: "u1", orgId: "org-b", email: "dir@utexas.edu" });
  });
});
