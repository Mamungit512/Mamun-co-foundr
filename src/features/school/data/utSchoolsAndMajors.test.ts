import { describe, it, expect } from "vitest";
import {
  UT_SCHOOLS_AND_PROGRAMS,
  DEGREE_TYPES,
  normalizeDegreeType,
  isUTCollege,
  getMajorOptions,
  getDegreeAbbreviation,
} from "./utSchoolsAndMajors";

describe("DEGREE_TYPES", () => {
  // Keep this in sync with the school_profiles_degree_type_check constraint
  // (supabase/migrations/20260917000000_generalize_school_degree_type.sql).
  it("is exactly bachelors, masters, doctorate, certificate", () => {
    expect(DEGREE_TYPES).toEqual(["bachelors", "masters", "doctorate", "certificate"]);
  });

  it("every catalog program uses a current degree type", () => {
    for (const school of Object.values(UT_SCHOOLS_AND_PROGRAMS)) {
      for (const program of school.programs) {
        expect(DEGREE_TYPES).toContain(program.degreeType);
      }
    }
  });
});

describe("normalizeDegreeType", () => {
  it("returns valid values unchanged", () => {
    for (const degreeType of DEGREE_TYPES) {
      expect(normalizeDegreeType(degreeType)).toBe(degreeType);
    }
  });

  it("maps the retired 'professional' value to 'doctorate'", () => {
    expect(normalizeDegreeType("professional")).toBe("doctorate");
  });

  it("returns undefined for values with no level, including the retired 'other'", () => {
    expect(normalizeDegreeType("other")).toBeUndefined();
    expect(normalizeDegreeType("")).toBeUndefined();
    expect(normalizeDegreeType(null)).toBeUndefined();
    expect(normalizeDegreeType(undefined)).toBeUndefined();
    expect(normalizeDegreeType("phd")).toBeUndefined();
    expect(normalizeDegreeType(42)).toBeUndefined();
  });
});

describe("isUTCollege", () => {
  it("is true for a known college key", () => {
    expect(isUTCollege("mccombs_business")).toBe(true);
  });

  it("is false for an unknown string, including inherited object properties", () => {
    expect(isUTCollege("toString")).toBe(false);
    expect(isUTCollege("")).toBe(false);
    expect(isUTCollege(undefined)).toBe(false);
  });
});

describe("getMajorOptions", () => {
  it("returns the programs at that level for the college", () => {
    expect(getMajorOptions("mccombs_business", "masters")).toEqual([
      "Business Administration",
      "Public Administration",
      "Finance",
      "Information Systems",
    ]);
  });

  it("falls back to all of the college's programs when none exist at that level", () => {
    // Cockrell only lists bachelors programs.
    expect(getMajorOptions("cockrell_engineering", "doctorate")).toEqual([
      "Computer Science",
      "Electrical & Computer Engineering",
      "Mechanical Engineering",
      "Biomedical Engineering",
      "Chemical Engineering",
    ]);
  });

  it("dedupes names and returns all programs when no level is given", () => {
    const options = getMajorOptions("mccombs_business", undefined);
    expect(options.filter((name) => name === "Business Administration")).toHaveLength(1);
  });

  it("returns an empty list for an unknown college", () => {
    expect(getMajorOptions("not_a_college", "masters")).toEqual([]);
    expect(getMajorOptions(undefined, "masters")).toEqual([]);
  });
});

describe("getDegreeAbbreviation", () => {
  it("uses the catalog abbreviation for an exact (college, level, major) match", () => {
    expect(getDegreeAbbreviation("mccombs_business", "masters", "Business Administration")).toBe("MBA");
    expect(getDegreeAbbreviation("mccombs_business", "bachelors", "Business Administration")).toBe("BBA");
  });

  it("matches case- and whitespace-insensitively", () => {
    expect(getDegreeAbbreviation("cockrell_engineering", "bachelors", " computer science ")).toBe("CS");
  });

  it("maps the legacy 'professional' value onto its now-doctorate catalog entry", () => {
    expect(getDegreeAbbreviation("dell_medical_school", "professional", "Doctor of Medicine")).toBe("MD");
  });

  it("falls back to the level's short label when there's no catalog match", () => {
    expect(getDegreeAbbreviation("cockrell_engineering", "masters", "Computer Science")).toBe("Master's");
    expect(getDegreeAbbreviation("liberal_arts", "doctorate", "Philosophy")).toBe("Doctorate");
    expect(getDegreeAbbreviation("not_a_college", "masters", "Anything")).toBe("Master's");
  });

  it("falls back to the old name-only lookup when there's no level (legacy NULL rows)", () => {
    expect(getDegreeAbbreviation("mccombs_business", undefined, "Business Administration")).toBe("BBA");
  });

  it("returns undefined when there's nothing to go on", () => {
    expect(getDegreeAbbreviation(undefined, undefined, undefined)).toBeUndefined();
    expect(getDegreeAbbreviation(null, null, null)).toBeUndefined();
  });
});
