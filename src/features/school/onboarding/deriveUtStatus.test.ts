import { describe, it, expect } from "vitest";
import { deriveUtStatus, hasGraduationYearPassed } from "./deriveUtStatus";

describe("hasGraduationYearPassed", () => {
  it("is false when gradYear is undefined", () => {
    expect(hasGraduationYearPassed(undefined)).toBe(false);
  });

  it("is false when gradYear is the current year or later", () => {
    const currentYear = new Date().getFullYear();
    expect(hasGraduationYearPassed(currentYear)).toBe(false);
    expect(hasGraduationYearPassed(currentYear + 1)).toBe(false);
  });

  it("is true when gradYear is before the current year", () => {
    const currentYear = new Date().getFullYear();
    expect(hasGraduationYearPassed(currentYear - 1)).toBe(true);
  });
});

describe("deriveUtStatus", () => {
  const currentYear = new Date().getFullYear();

  it("corrects student to alumni when gradYear has already passed", () => {
    expect(deriveUtStatus("student", currentYear - 1)).toBe("alumni");
  });

  it("leaves student as-is when gradYear is current or future", () => {
    expect(deriveUtStatus("student", currentYear)).toBe("student");
    expect(deriveUtStatus("student", currentYear + 1)).toBe("student");
  });

  it("leaves student as-is when gradYear is unset", () => {
    expect(deriveUtStatus("student", undefined)).toBe("student");
  });

  it("trusts an explicit alumni selection regardless of gradYear", () => {
    expect(deriveUtStatus("alumni", currentYear + 2)).toBe("alumni");
  });

  it("passes through an undefined utStatus", () => {
    expect(deriveUtStatus(undefined, currentYear - 1)).toBeUndefined();
  });
});
