import { describe, it, expect } from "vitest";
import {
  matchCounts,
  monthKey,
  monthlySeries,
  reconcile,
  type CompletedProfile,
  type SchoolAccount,
} from "./reconcile";
import { belongsToOrg, searchDomains, type ClerkRecord } from "./clerkAccounts";

const acct = (
  id: string,
  createdAt: string,
  isStaff = false,
): SchoolAccount => ({
  id,
  createdAt,
  maskedEmail: "a***@utexas.edu",
  isStaff,
});
const done = (userId: string, completedAt: string): CompletedProfile => ({
  userId,
  completedAt,
});

// Mirrors the build plan fixture: 12 live accounts (2 staff, 10 students),
// 7 completed profiles: 5 students, 1 staff, 1 owned by a deleted account.
function fixture() {
  const accounts = [
    ...Array.from({ length: 10 }, (_, i) =>
      acct(`s${i}`, "2026-09-10T12:00:00Z"),
    ),
    acct("staff1", "2026-08-01T12:00:00Z", true),
    acct("staff2", "2026-08-02T12:00:00Z", true),
  ];
  const profiles = [
    ...["s0", "s1", "s2", "s3", "s4"].map((id) =>
      done(id, "2026-09-12T12:00:00Z"),
    ),
    done("staff1", "2026-08-05T12:00:00Z"),
    done("deleted-user", "2026-08-20T12:00:00Z"),
  ];
  return { accounts, profiles };
}

describe("reconcile", () => {
  it("matches the hand-counted fixture", () => {
    const { accounts, profiles } = fixture();
    expect(reconcile(accounts, profiles, 7)).toEqual({
      student_accounts: 10,
      reconciled: 5,
      ghost: 5,
      orphan: 1,
      staff_accounts: 2,
      staff_with_profile: 1,
      completed_profiles: 7,
      legacy_total_signups: 7,
    });
  });

  it("ignores duplicate profile rows for the same user", () => {
    const { accounts, profiles } = fixture();
    const result = reconcile(accounts, [...profiles, profiles[0]], 7);
    expect(result.completed_profiles).toBe(7);
  });

  it("handles a school with no accounts", () => {
    const result = reconcile([], [], 0);
    expect(result.student_accounts).toBe(0);
    expect(monthlySeries([], [])).toEqual([]);
  });
});

describe("monthlySeries", () => {
  it("fills quiet months with zero rows and a null rate", () => {
    const accounts = [
      acct("a", "2026-07-10T12:00:00Z"),
      acct("b", "2026-09-10T12:00:00Z"),
    ];
    const profiles = [done("a", "2026-07-11T12:00:00Z")];
    const series = monthlySeries(
      accounts,
      profiles,
      new Date("2026-10-06T12:00:00Z"),
    );
    expect(series.map((p) => p.month)).toEqual([
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
    ]);
    expect(series[1]).toMatchObject({
      accounts_created: 0,
      completion_rate: null,
      accounts_total: 1,
    });
    expect(series[0].completion_rate).toBe(1);
    expect(series[2].completion_rate).toBe(0);
    expect(series[3]).toMatchObject({ accounts_total: 2, profiles_total: 1 });
  });

  it("buckets months in the school's timezone", () => {
    // 2026-10-01 03:00 UTC is still Sept 30 in Chicago.
    expect(monthKey("2026-10-01T03:00:00Z", "America/Chicago")).toBe("2026-09");
    expect(monthKey("2026-10-01T03:00:00Z", "UTC")).toBe("2026-10");
  });
});

describe("clerk scoping", () => {
  const record = (over: Partial<ClerkRecord>): ClerkRecord => ({
    id: "u",
    createdAt: "2026-09-01T00:00:00Z",
    maskedEmail: "x***@y",
    emailHash: null,
    emailDomain: null,
    publicOrgId: null,
    ...over,
  });
  const domains = ["utexas.edu", "eid.utexas.edu", "mccombs.utexas.edu"];

  it("keeps allowed domains and org claims, drops look-alikes", () => {
    expect(
      belongsToOrg(record({ emailDomain: "utexas.edu" }), "org", domains),
    ).toBe(true);
    expect(
      belongsToOrg(
        record({ emailDomain: "mccombs.utexas.edu" }),
        "org",
        domains,
      ),
    ).toBe(true);
    expect(
      belongsToOrg(record({ emailDomain: "notutexas.edu" }), "org", domains),
    ).toBe(false);
    expect(
      belongsToOrg(
        record({ emailDomain: "gmail.com", publicOrgId: "org" }),
        "org",
        domains,
      ),
    ).toBe(true);
    expect(
      belongsToOrg(
        record({ emailDomain: "gmail.com", publicOrgId: "other" }),
        "org",
        domains,
      ),
    ).toBe(false);
    expect(belongsToOrg(record({}), "org", domains)).toBe(false);
  });

  it("searches only the parent domain when subdomains are listed", () => {
    expect(searchDomains(domains)).toEqual(["utexas.edu"]);
  });
});

describe("matchCounts", () => {
  const completed = new Set(["a", "b", "c", "d", "staff", "x"]);
  const students = new Set(["a", "b", "c", "d", "x"]); // staff is not a student

  it("counts linked and mutual pairs but not one-sided intents", () => {
    const result = matchCounts(
      [{ user_a_id: "a", user_b_id: "b" }],
      [
        { from_user_id: "c", to_user_id: "d" },
        { from_user_id: "d", to_user_id: "c" },
        { from_user_id: "a", to_user_id: "x" }, // pending: x never replied
      ],
      completed,
      students,
    );
    expect(result).toEqual({
      matched_pairs: 2,
      linked_pairs: 1,
      mutual_pairs: 1,
      students_matched: 4,
    });
  });

  it("counts a pair once when it is both linked and mutual", () => {
    const result = matchCounts(
      [{ user_a_id: "a", user_b_id: "b" }],
      [
        { from_user_id: "a", to_user_id: "b" },
        { from_user_id: "b", to_user_id: "a" },
      ],
      completed,
      students,
    );
    expect(result.matched_pairs).toBe(1);
    expect(result.linked_pairs).toBe(1);
    expect(result.mutual_pairs).toBe(0);
  });

  it("ignores pairs where someone has not completed a profile", () => {
    const result = matchCounts(
      [{ user_a_id: "a", user_b_id: "ghost" }],
      [
        { from_user_id: "ghost", to_user_id: "b" },
        { from_user_id: "b", to_user_id: "ghost" },
      ],
      completed,
      students,
    );
    expect(result.matched_pairs).toBe(0);
  });

  it("counts a student matched to staff once, and not the staff member", () => {
    const result = matchCounts(
      [{ user_a_id: "a", user_b_id: "staff" }],
      [],
      completed,
      students,
    );
    expect(result.matched_pairs).toBe(1);
    expect(result.students_matched).toBe(1);
  });

  it("counts a student in several pairs once", () => {
    const result = matchCounts(
      [
        { user_a_id: "a", user_b_id: "b" },
        { user_a_id: "a", user_b_id: "c" },
      ],
      [],
      completed,
      students,
    );
    expect(result.matched_pairs).toBe(2);
    expect(result.students_matched).toBe(3);
  });
});
