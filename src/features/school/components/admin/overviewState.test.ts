import { describe, it, expect } from "vitest";
import { overviewViewState } from "./overviewState";
import type { RetentionOverview } from "@/app/api/school/retention/overview/route";

const overview = (students: number): RetentionOverview => ({
  reconciliation: {
    student_accounts: students,
    reconciled: 0,
    ghost: students,
    orphan: 0,
    staff_accounts: 0,
    staff_with_profile: 0,
    completed_profiles: 0,
    legacy_total_signups: 0,
  },
  monthlySeries: [],
  connections: { connections: 0, students_connected: 0, messages: 0 },
  matches: {
    matched_pairs: 0,
    linked_pairs: 0,
    mutual_pairs: 0,
    students_matched: 0,
  },
  freshness: { fetchedAt: "2026-10-06T12:00:00Z", staleAfterSeconds: 21600 },
});

describe("overviewViewState", () => {
  it("shows loading only while there is nothing to show", () => {
    expect(overviewViewState(null, true, false)).toBe("loading");
    expect(overviewViewState(overview(5), true, false)).toBe("ready");
  });

  it("shows the empty state for a school with no student accounts", () => {
    expect(overviewViewState(overview(0), false, false)).toBe("empty");
  });

  it("shows an error rather than numbers when the load failed", () => {
    expect(overviewViewState(null, false, true)).toBe("error");
    expect(overviewViewState(overview(5), false, true)).toBe("error");
    expect(overviewViewState(null, false, false)).toBe("error");
  });

  it("shows the numbers when there are students", () => {
    expect(overviewViewState(overview(5), false, false)).toBe("ready");
  });
});
