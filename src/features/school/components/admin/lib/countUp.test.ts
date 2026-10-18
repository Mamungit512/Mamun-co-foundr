import { describe, it, expect } from "vitest";
import { easeOutCubic, valueAt } from "./countUp";

describe("easeOutCubic", () => {
  it("starts at 0, ends at 1, and clamps outside that range", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });

  it("moves fast early and slows down", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe("valueAt", () => {
  it("lands exactly on the endpoints", () => {
    expect(valueAt(0, 48, 0)).toBe(0);
    expect(valueAt(0, 48, 1)).toBe(48);
  });

  it("counts down as well as up", () => {
    expect(valueAt(50, 40, 1)).toBe(40);
    expect(valueAt(50, 40, 0.5)).toBeLessThan(50);
    expect(valueAt(50, 40, 0.5)).toBeGreaterThan(40);
  });

  it("always returns whole numbers", () => {
    for (const t of [0.1, 0.33, 0.7, 0.9]) {
      expect(Number.isInteger(valueAt(0, 17, t))).toBe(true);
    }
  });
});
