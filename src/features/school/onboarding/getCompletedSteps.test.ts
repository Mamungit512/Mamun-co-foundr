import { describe, it, expect } from "vitest";
import { getCompletedSteps } from "./getCompletedSteps";
import type { OrgOnboarding } from "@/features/school/registry/types";

const UT_ONBOARDING: OrgOnboarding = {
  totalSteps: 5,
  apiEndpoint: "/api/profile",
  steps: ["photo", "about", "startup", "background", "review"],
  step2RequiredFields: [
    "firstName",
    "lastName",
    "title",
    "country",
    "city",
    "experience",
    "personalIntro",
    "isTechnical",
    "utStatus",
  ],
};

const utStep3Completion = (data: OnboardingData) =>
  data.hasStartup !== undefined &&
  data.intent !== undefined &&
  (data.hasStartup === "no" ||
    (data.hasStartup === "yes" &&
      data.coFounderStatus !== undefined &&
      data.equityExpectation !== undefined));

const GENERIC_ONBOARDING: OrgOnboarding = {
  totalSteps: 4,
  apiEndpoint: "/api/profile",
  steps: ["photo", "about", "background", "review"],
  step2RequiredFields: [
    "firstName",
    "lastName",
    "title",
    "country",
    "city",
    "experience",
    "personalIntro",
    "isTechnical",
  ],
};

const BASE_STEP2_FIELDS: Partial<OnboardingData> = {
  firstName: "Ada",
  lastName: "Lovelace",
  title: "Engineer",
  country: "US",
  city: "Austin",
  experience: "3",
  personalIntro: "Builder",
  isTechnical: "yes",
};

describe("getCompletedSteps", () => {
  describe("step 1", () => {
    it("is complete when pfp_url is set", () => {
      const result = getCompletedSteps({ pfp_url: "/img/photo.jpg" }, new Set(), UT_ONBOARDING, utStep3Completion);
      expect(result.has(1)).toBe(true);
    });

    it("is incomplete when pfp_url is absent", () => {
      const result = getCompletedSteps({}, new Set(), UT_ONBOARDING, utStep3Completion);
      expect(result.has(1)).toBe(false);
    });
  });

  describe("step 2 — required fields", () => {
    it("is complete when all step2RequiredFields are truthy (UT)", () => {
      const data: Partial<OnboardingData> = { ...BASE_STEP2_FIELDS, utStatus: "student" };
      const result = getCompletedSteps(data as OnboardingData, new Set(), UT_ONBOARDING, utStep3Completion);
      expect(result.has(2)).toBe(true);
    });

    it("is incomplete when any required field is missing (UT)", () => {
      const data: Partial<OnboardingData> = { ...BASE_STEP2_FIELDS }; // utStatus missing
      const result = getCompletedSteps(data as OnboardingData, new Set(), UT_ONBOARDING, utStep3Completion);
      expect(result.has(2)).toBe(false);
    });

    it("is complete when all generic step2RequiredFields are truthy", () => {
      const data: Partial<OnboardingData> = { ...BASE_STEP2_FIELDS };
      const result = getCompletedSteps(data as OnboardingData, new Set(), GENERIC_ONBOARDING);
      expect(result.has(2)).toBe(true);
    });
  });

  describe("step 3 — conditional completion", () => {
    it("is complete when step3Completion returns true (no startup)", () => {
      const data: Partial<OnboardingData> = { hasStartup: "no", intent: "join_me" };
      const result = getCompletedSteps(data as OnboardingData, new Set(), UT_ONBOARDING, utStep3Completion);
      expect(result.has(3)).toBe(true);
    });

    it("is complete when step3Completion returns true (has startup, full details)", () => {
      const data: Partial<OnboardingData> = {
        hasStartup: "yes",
        intent: "join_me",
        coFounderStatus: "looking",
        equityExpectation: 50,
      };
      const result = getCompletedSteps(data as OnboardingData, new Set(), UT_ONBOARDING, utStep3Completion);
      expect(result.has(3)).toBe(true);
    });

    it("is incomplete when startup details are partial", () => {
      // hasStartup=yes but coFounderStatus and equityExpectation missing
      const data: Partial<OnboardingData> = { hasStartup: "yes", intent: "join_me" };
      const result = getCompletedSteps(data as OnboardingData, new Set(), UT_ONBOARDING, utStep3Completion);
      expect(result.has(3)).toBe(false);
    });

    it("uses visited-based completion when step3Completion is undefined (generic config)", () => {
      const result = getCompletedSteps({} as OnboardingData, new Set([3]), GENERIC_ONBOARDING);
      expect(result.has(3)).toBe(true);
    });
  });

  describe("steps 4 and 5 — visited-based (UT)", () => {
    it("step 4 is complete when visited", () => {
      const result = getCompletedSteps({} as OnboardingData, new Set([4]), UT_ONBOARDING, utStep3Completion);
      expect(result.has(4)).toBe(true);
    });

    it("step 5 is complete when visited", () => {
      const result = getCompletedSteps({} as OnboardingData, new Set([5]), UT_ONBOARDING, utStep3Completion);
      expect(result.has(5)).toBe(true);
    });

    it("step 4 is incomplete when not visited", () => {
      const result = getCompletedSteps({} as OnboardingData, new Set(), UT_ONBOARDING, utStep3Completion);
      expect(result.has(4)).toBe(false);
    });
  });
});
