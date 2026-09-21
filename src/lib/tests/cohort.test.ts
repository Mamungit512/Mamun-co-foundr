import { describe, it, expect } from "vitest";
import { getCurrentCohortLabel } from "../cohort";

describe("getCurrentCohortLabel", () => {
  it("returns Fall for August through December", () => {
    expect(getCurrentCohortLabel(new Date(2026, 8, 20))).toBe("Fall 2026 Cohort");
    expect(getCurrentCohortLabel(new Date(2026, 7, 1))).toBe("Fall 2026 Cohort");
    expect(getCurrentCohortLabel(new Date(2026, 11, 31))).toBe("Fall 2026 Cohort");
  });

  it("returns Spring for January through May", () => {
    expect(getCurrentCohortLabel(new Date(2027, 0, 15))).toBe("Spring 2027 Cohort");
    expect(getCurrentCohortLabel(new Date(2027, 4, 31))).toBe("Spring 2027 Cohort");
  });

  it("returns Summer for June through July", () => {
    expect(getCurrentCohortLabel(new Date(2027, 5, 1))).toBe("Summer 2027 Cohort");
    expect(getCurrentCohortLabel(new Date(2027, 6, 31))).toBe("Summer 2027 Cohort");
  });
});
