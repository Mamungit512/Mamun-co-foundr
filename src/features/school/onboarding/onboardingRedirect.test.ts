import { describe, it, expect } from "vitest";
import { getGatedFeatureLabel, resolvePostOnboardingRedirect } from "./onboardingRedirect";

describe("getGatedFeatureLabel", () => {
  it("maps known feature paths to human-readable labels", () => {
    expect(getGatedFeatureLabel("/school/ut-austin/cofounder")).toBe("invite a co-founder");
    expect(getGatedFeatureLabel("/school/ut-austin/matches?tab=messages")).toBe(
      "view your matches",
    );
    expect(getGatedFeatureLabel("/school/ut-austin/profile")).toBe("edit your profile");
    expect(getGatedFeatureLabel("/school/ut-austin/dashboard")).toBe("access your dashboard");
    expect(getGatedFeatureLabel("/school/ut-austin/invite/abc123")).toBe("accept your invite");
  });

  it("falls back to a generic label for unknown or missing paths", () => {
    expect(getGatedFeatureLabel("/school/ut-austin/some-new-page")).toBe("continue");
    expect(getGatedFeatureLabel(null)).toBe("continue");
    expect(getGatedFeatureLabel(undefined)).toBe("continue");
    expect(getGatedFeatureLabel("")).toBe("continue");
  });
});

describe("resolvePostOnboardingRedirect", () => {
  const slug = "ut-austin";

  it("returns the redirect target when it stays within the school", () => {
    expect(resolvePostOnboardingRedirect(slug, "/school/ut-austin/cofounder")).toBe(
      "/school/ut-austin/cofounder",
    );
    expect(resolvePostOnboardingRedirect(slug, "/school/ut-austin/matches?tab=messages")).toBe(
      "/school/ut-austin/matches?tab=messages",
    );
  });

  it("falls back to the dashboard when no redirect is provided", () => {
    expect(resolvePostOnboardingRedirect(slug, null)).toBe("/school/ut-austin/dashboard");
    expect(resolvePostOnboardingRedirect(slug, undefined)).toBe("/school/ut-austin/dashboard");
    expect(resolvePostOnboardingRedirect(slug, "")).toBe("/school/ut-austin/dashboard");
  });

  it("falls back to the dashboard for redirects outside this school", () => {
    expect(resolvePostOnboardingRedirect(slug, "/school/other-school/cofounder")).toBe(
      "/school/ut-austin/dashboard",
    );
    expect(resolvePostOnboardingRedirect(slug, "https://evil.example.com")).toBe(
      "/school/ut-austin/dashboard",
    );
    expect(resolvePostOnboardingRedirect(slug, "//evil.example.com")).toBe(
      "/school/ut-austin/dashboard",
    );
  });

  it("falls back to the dashboard rather than looping back into onboarding", () => {
    expect(resolvePostOnboardingRedirect(slug, "/school/ut-austin/onboarding")).toBe(
      "/school/ut-austin/dashboard",
    );
    expect(resolvePostOnboardingRedirect(slug, "/school/ut-austin/onboarding/step2")).toBe(
      "/school/ut-austin/dashboard",
    );
  });
});
