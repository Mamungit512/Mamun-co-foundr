import { describe, expect, it } from "vitest";
import {
  cleanLinkedin,
  firstIncompleteStep,
  formatMissing,
  gradYearBounds,
  gradYearChoices,
  isGradYearValid,
  isLinkedinValid,
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

  it("blocks an invalid LinkedIn link but not a blank one", () => {
    expect(missingFor(2, { ...STEP2_DONE, linkedin: "" }, {}, NOW)).toEqual([]);
    expect(missingFor(2, { ...STEP2_DONE, linkedin: "twitter.com/ada" }, {}, NOW)).toEqual([
      "a valid LinkedIn link (or leave it blank)",
    ]);
  });

  it("treats 'Not sure yet' as an answered archetype", () => {
    const data = { ...STEP3_DONE, archetype: undefined };
    expect(missingFor(3, data, {}, NOW)).toEqual(["a founder type"]);
    expect(missingFor(3, data, { archetypeUnsure: true }, NOW)).toEqual([]);
  });

  it("caps interests and requires a 15+ character mission", () => {
    expect(missingFor(4, STEP4_DONE, {}, NOW)).toEqual([]);
    expect(
      missingFor(4, { ...STEP4_DONE, utSectorInterests: ["ai_ml", "data", "ux", "media"] }, {}, NOW),
    ).toEqual(["3 interests at most"]);
    expect(missingFor(4, { ...STEP4_DONE, personalIntro: "  too short   " }, {}, NOW)).toEqual([
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
        { ...STEP2_DONE, gradYear: new Date().getFullYear(), ...STEP3_DONE, ...STEP4_DONE },
        {},
      ),
    ).toBeNull();
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
});
