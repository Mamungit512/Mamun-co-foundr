import { describe, it, expect } from "vitest";
import { describeFreshness, percent } from "./freshness";

const now = new Date("2026-10-06T12:00:00Z");

describe("describeFreshness", () => {
  it("describes recent fetches", () => {
    expect(describeFreshness("2026-10-06T11:59:40Z", 21600, now)).toEqual({
      label: "just now",
      stale: false,
    });
    expect(describeFreshness("2026-10-06T11:56:00Z", 21600, now).label).toBe(
      "4 minutes ago",
    );
    expect(describeFreshness("2026-10-06T09:00:00Z", 21600, now).label).toBe(
      "3 hours ago",
    );
  });

  it("flags data older than the cache lifetime", () => {
    expect(describeFreshness("2026-10-06T05:00:00Z", 21600, now).stale).toBe(
      true,
    );
    expect(describeFreshness("2026-10-06T06:00:00Z", 21600, now).stale).toBe(
      false,
    );
  });
});

describe("percent", () => {
  it("rounds and refuses to divide by zero", () => {
    expect(percent(48, 80)).toBe(60);
    expect(percent(1, 3)).toBe(33);
    expect(percent(0, 0)).toBeNull();
  });
});
