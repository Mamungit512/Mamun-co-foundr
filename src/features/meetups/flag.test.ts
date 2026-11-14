import { afterEach, describe, expect, it, vi } from "vitest";
import { isMeetupsEnabled } from "./flag";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isMeetupsEnabled", () => {
  it("is off when the env var is unset", () => {
    vi.stubEnv("MEETUPS_V1_ORGS", "");
    expect(isMeetupsEnabled("ut")).toBe(false);
  });

  it("is on only for listed slugs", () => {
    vi.stubEnv("MEETUPS_V1_ORGS", "ut");
    expect(isMeetupsEnabled("ut")).toBe(true);
    expect(isMeetupsEnabled("other-school")).toBe(false);
  });

  it("handles lists, whitespace and case", () => {
    vi.stubEnv("MEETUPS_V1_ORGS", " UT , asu ");
    expect(isMeetupsEnabled("ut")).toBe(true);
    expect(isMeetupsEnabled("asu")).toBe(true);
    expect(isMeetupsEnabled("mit")).toBe(false);
  });

  it("is off for a missing slug", () => {
    vi.stubEnv("MEETUPS_V1_ORGS", "ut");
    expect(isMeetupsEnabled(null)).toBe(false);
    expect(isMeetupsEnabled(undefined)).toBe(false);
  });
});
