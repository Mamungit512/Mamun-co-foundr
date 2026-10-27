import { describe, expect, it } from "vitest";
import {
  cleanLinkedin,
  firstIncompleteStep,
  formatMissing,
  gradYearBounds,
  gradYearChoices,
  isGithubValid,
  isGradYearValid,
  isLinkedinValid,
  isWebsiteValid,
  missingFor,
  normalizeUi,
} from "./validation";

const NOW = 2026;

const STEP2_DONE: OnboardingData = {
  pfp_url: "https://cdn.example.com/me.jpg",
  firstName: "Ada",
  lastName: "Lovelace",
  utStatus: "student",
  gradYear: 2027,
  utDegreeType: "bachelors",
  utCollege: "cockrell_engineering",
  city: "Austin",
  country: "United States",
};

const STEP3_DONE: OnboardingData = {
  title: "CS student",
  isTechnical: "yes",
  archetype: "the_architect",
};

const STEP4_DONE: OnboardingData = {
  hasStartup: "no",
};

const STEP5_DONE: OnboardingData = {
  intent: "seeking_to_join",
  utSectorInterests: ["ai_ml"],
  personalIntro: "Make it easier for students to find co-founders.",
};

describe("graduation year", () => {
  it("offers this year forward for students and last year back for alumni", () => {
    expect(gradYearChoices("student", NOW)).toEqual([2026, 2027, 2028, 2029, 2030]);
    expect(gradYearChoices("alumni", NOW)).toEqual([2025, 2024, 2023, 2022, 2021]);
  });

  it("keeps the previous form's bounds", () => {
    expect(gradYearBounds("student", NOW)).toEqual({ min: 2026, max: 2036 });
    expect(gradYearBounds("alumni", NOW)).toEqual({ min: 1965, max: 2026 });
  });

  it("rejects years outside the bounds for the chosen status", () => {
    expect(isGradYearValid("student", 2025, NOW)).toBe(false);
    expect(isGradYearValid("alumni", 2027, NOW)).toBe(false);
    expect(isGradYearValid("alumni", 1990, NOW)).toBe(true);
    expect(isGradYearValid(undefined, 2027, NOW)).toBe(false);
  });
});

describe("LinkedIn", () => {
  it("normalizes scheme, www and trailing slashes", () => {
    expect(cleanLinkedin(" https://www.linkedin.com/in/ada/ ")).toBe("linkedin.com/in/ada");
  });

  it("accepts blank and profile links, rejects other URLs", () => {
    expect(isLinkedinValid("")).toBe(true);
    expect(isLinkedinValid(undefined)).toBe(true);
    expect(isLinkedinValid("uk.linkedin.com/in/ada-l")).toBe(true);
    expect(isLinkedinValid("linkedin.com/company/acme")).toBe(false);
    expect(isLinkedinValid("ada")).toBe(false);
  });
});

describe("GitHub and startup website", () => {
  it("accepts blank, profile and repo links", () => {
    expect(isGithubValid("")).toBe(true);
    expect(isGithubValid("https://www.github.com/ada")).toBe(true);
    expect(isGithubValid("github.com/ada/engine")).toBe(true);
    expect(isGithubValid("gitlab.com/ada")).toBe(false);
    expect(isGithubValid("ada")).toBe(false);
  });

  it("accepts blank and domain-like websites", () => {
    expect(isWebsiteValid(undefined)).toBe(true);
    expect(isWebsiteValid("lumenlearn.co")).toBe(true);
    expect(isWebsiteValid("https://lumenlearn.co/demo")).toBe(true);
    expect(isWebsiteValid("lumenlearn")).toBe(false);
    expect(isWebsiteValid("not a site")).toBe(false);
  });
});

describe("missingFor", () => {
  it("lists every required step 2 answer when empty", () => {
    expect(missingFor(2, {}, {}, NOW)).toEqual([
      "a photo",
      "your name",
      "student or alumni",
      "degree level",
      "your college",
      "where you’re based",
    ]);
  });

  it("asks for the graduation year once status is chosen", () => {
    const data = { ...STEP2_DONE, gradYear: undefined };
    expect(missingFor(2, data, {}, NOW)).toEqual(["graduation year"]);
  });

  it("no longer asks about LinkedIn", () => {
    expect(missingFor(2, { ...STEP2_DONE, linkedin: "twitter.com/ada" }, {}, NOW)).toEqual([]);
  });

  it("treats 'Not sure yet' as an answered archetype", () => {
    const data = { ...STEP3_DONE, archetype: undefined };
    expect(missingFor(3, data, {}, NOW)).toEqual(["a founder type"]);
    expect(missingFor(3, data, { archetypeUnsure: true }, NOW)).toEqual([]);
  });

  it("requires the startup answer on step 4", () => {
    expect(missingFor(4, {}, {}, NOW)).toEqual(["whether you have a startup"]);
    expect(missingFor(4, {}, { startupMode: "exploring" }, NOW)).toEqual([]);
  });

  it("requires a startup name unless exploring", () => {
    for (const startupMode of ["building", "idea"] as const) {
      expect(missingFor(4, {}, { startupMode }, NOW)).toEqual(["your startup’s name"]);
      expect(missingFor(4, { startupName: "  " }, { startupMode }, NOW)).toEqual(["your startup’s name"]);
      expect(missingFor(4, { startupName: "Lumen Learn" }, { startupMode }, NOW)).toEqual([]);
    }
  });

  it("blocks invalid links on step 4 but not blank ones", () => {
    const ui = { startupMode: "exploring" } as const;
    expect(missingFor(4, { linkedin: "", git: "", startupWebsite: "" }, ui, NOW)).toEqual([]);
    expect(missingFor(4, { linkedin: "twitter.com/ada" }, ui, NOW)).toEqual([
      "a valid LinkedIn link (or leave it blank)",
    ]);
    expect(missingFor(4, { git: "gitlab.com/ada" }, ui, NOW)).toEqual([
      "a valid GitHub link (or leave it blank)",
    ]);
    expect(missingFor(4, { startupWebsite: "not a site" }, ui, NOW)).toEqual([
      "a valid startup website (or leave it blank)",
    ]);
  });

  it("caps interests and requires a 15+ character mission on step 5", () => {
    expect(missingFor(5, STEP5_DONE, {}, NOW)).toEqual([]);
    expect(
      missingFor(5, { ...STEP5_DONE, utSectorInterests: ["ai_ml", "data", "ux", "media"] }, {}, NOW),
    ).toEqual(["3 interests at most"]);
    expect(missingFor(5, { ...STEP5_DONE, personalIntro: "  too short   " }, {}, NOW)).toEqual([
      "a longer mission (15+ characters)",
    ]);
  });
});

describe("firstIncompleteStep", () => {
  it("returns the earliest step with missing answers, or null when complete", () => {
    expect(firstIncompleteStep({}, {})).toBe(2);
    expect(firstIncompleteStep({ ...STEP2_DONE, gradYear: new Date().getFullYear() }, {})).toBe(3);
    expect(
      firstIncompleteStep(
        { ...STEP2_DONE, gradYear: new Date().getFullYear(), ...STEP3_DONE, ...STEP4_DONE, ...STEP5_DONE },
        { startupMode: "exploring" },
      ),
    ).toBeNull();
    expect(
      firstIncompleteStep(
        { ...STEP2_DONE, gradYear: new Date().getFullYear(), ...STEP3_DONE, ...STEP5_DONE },
        {},
      ),
    ).toBe(4);
  });
});

describe("formatMissing", () => {
  it("builds the 'To continue' line", () => {
    expect(formatMissing(["graduation year", "degree level"])).toBe(
      "To continue: graduation year, degree level.",
    );
    expect(formatMissing([])).toBe("");
  });
});

describe("normalizeUi", () => {
  it("selects Other for a saved year outside the quick picks", () => {
    expect(normalizeUi({ utStatus: "alumni", gradYear: 1999 }, {}, NOW)).toEqual({
      gradYearOther: true,
      gradYearText: "1999",
    });
    expect(normalizeUi({ utStatus: "student", gradYear: 2027 }, {}, NOW)).toEqual({});
  });

  it("derives the startup answer from the saved startup fields", () => {
    expect(normalizeUi({}, {}, NOW)).toEqual({});
    expect(normalizeUi({ hasStartup: "no" }, {}, NOW)).toEqual({ startupMode: "exploring" });
    expect(normalizeUi({ hasStartup: "yes", startupFunding: "Idea stage" }, {}, NOW)).toEqual({
      startupMode: "idea",
    });
    expect(normalizeUi({ hasStartup: "yes", startupFunding: "Seed" }, {}, NOW)).toEqual({
      startupMode: "building",
    });
    expect(normalizeUi({ hasStartup: "no" }, { startupMode: "idea" }, NOW)).toEqual({ startupMode: "idea" });
  });
});
