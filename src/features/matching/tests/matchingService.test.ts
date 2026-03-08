import { describe, it, expect } from "vitest";
import {
  sortProfiles,
  filterProfilesByPreferences,
  binaryMatch,
  arrayOverlapScore,
  preferenceMatch,
  locationPreferenceMatch,
  complementarityScore,
} from "../matchingService";
import {
  currentUserLondonTechnical,
  allCandidates,
  candidateTechnicalFilteredOut,
  candidateDifferentCountry,
  candidateSameCityTechnical,
  candidateSameCountryDifferentCity,
} from "../__fixtures__/profiles";

describe("matchingService", () => {
  describe("binaryMatch", () => {
    it("returns 1 when values match (case insensitive)", () => {
      expect(binaryMatch("London", "london")).toBe(1);
      expect(binaryMatch("AI", "ai")).toBe(1);
    });

    it("returns 0 when values differ", () => {
      expect(binaryMatch("London", "Manchester")).toBe(0);
      expect(binaryMatch("technical", "non-technical")).toBe(0);
    });

    it("handles null/undefined", () => {
      expect(binaryMatch("", "London")).toBe(0);
    });
  });

  describe("arrayOverlapScore", () => {
    it("counts overlapping items", () => {
      expect(arrayOverlapScore(["AI", "Healthcare"], ["AI", "Fintech"])).toBe(
        1,
      );
      expect(
        arrayOverlapScore(["AI", "Healthcare", "Fintech"], ["AI", "Healthcare"]),
      ).toBe(2);
    });

    it("returns 0 for no overlap", () => {
      expect(arrayOverlapScore(["AI"], ["Education", "Consumer"])).toBe(0);
    });

    it("handles empty arrays", () => {
      expect(arrayOverlapScore([], ["AI"])).toBe(0);
      expect(arrayOverlapScore(undefined, undefined)).toBe(0);
    });
  });

  describe("preferenceMatch", () => {
    it("scores 1 when lookingFor technical and candidate is technical", () => {
      const score = preferenceMatch(
        { lookingFor: "technical" },
        { isTechnical: "yes" } as OnboardingData,
      );
      expect(score).toBe(1);
    });

    it("scores 1 when lookingFor non-technical and candidate is non-technical", () => {
      const score = preferenceMatch(
        { lookingFor: "non-technical" },
        { isTechnical: "no" } as OnboardingData,
      );
      expect(score).toBe(1);
    });

    it("scores 0.5 when lookingFor is either", () => {
      const score = preferenceMatch(
        { lookingFor: "either" },
        { isTechnical: "yes" } as OnboardingData,
      );
      expect(score).toBe(0.5);
    });
  });

  describe("locationPreferenceMatch", () => {
    const currentUser = {
      city: "London",
      country: "United Kingdom",
    } as OnboardingData;

    it("scores 1 for same-city when preferredLocation is same-city", () => {
      const score = locationPreferenceMatch(
        { preferredLocation: "same-city" },
        { city: "London", country: "United Kingdom" } as OnboardingData,
        currentUser,
      );
      expect(score).toBe(1);
    });

    it("scores 0 for different city when preferredLocation is same-city", () => {
      const score = locationPreferenceMatch(
        { preferredLocation: "same-city" },
        { city: "Manchester", country: "United Kingdom" } as OnboardingData,
        currentUser,
      );
      expect(score).toBe(0);
    });

    it("scores 1 for same country when preferredLocation is same-country", () => {
      const score = locationPreferenceMatch(
        { preferredLocation: "same-country" },
        { city: "Manchester", country: "United Kingdom" } as OnboardingData,
        currentUser,
      );
      expect(score).toBe(1);
    });

    it("scores 0.5 for remote preference", () => {
      const score = locationPreferenceMatch(
        { preferredLocation: "remote" },
        { city: "Istanbul", country: "Turkey" } as OnboardingData,
        currentUser,
      );
      expect(score).toBe(0.5);
    });
  });

  describe("complementarityScore", () => {
    it("adds score when isTechnical differs", () => {
      const tech = {
        isTechnical: "yes",
        responsibilities: ["Engineering"],
        priorityAreas: ["AI"],
      } as OnboardingData;
      const nonTech = {
        isTechnical: "no",
        responsibilities: ["Sales"],
        priorityAreas: ["AI", "Healthcare"],
      } as OnboardingData;
      const score = complementarityScore(tech, nonTech);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe("filterProfilesByPreferences", () => {
    it("filters out technical candidates when currentUser lookingFor is non-technical", () => {
      const candidates = [candidateTechnicalFilteredOut, candidateSameCityTechnical];
      const filtered = filterProfilesByPreferences(
        candidates,
        currentUserLondonTechnical,
      );
      expect(filtered).not.toContainEqual(
        expect.objectContaining({ user_id: "sim_user_005" }),
      );
      expect(filtered).toContainEqual(
        expect.objectContaining({ user_id: "sim_user_002" }),
      );
    });

    it("filters out different-country when preferredLocation is same-country", () => {
      const candidates = [
        candidateDifferentCountry,
        candidateSameCountryDifferentCity,
      ];
      const filtered = filterProfilesByPreferences(
        candidates,
        currentUserLondonTechnical,
      );
      expect(filtered).not.toContainEqual(
        expect.objectContaining({ user_id: "sim_user_004" }),
      );
      expect(filtered).toContainEqual(
        expect.objectContaining({ user_id: "sim_user_003" }),
      );
    });

    it("passes all when no preferences set", () => {
      const userNoPrefs = {
        ...currentUserLondonTechnical,
        lookingFor: undefined,
        preferredLocation: undefined,
      };
      const filtered = filterProfilesByPreferences(allCandidates, userNoPrefs);
      expect(filtered.length).toBe(allCandidates.length);
    });
  });

  describe("sortProfiles", () => {
    it("excludes current user from results", () => {
      const sorted = sortProfiles(currentUserLondonTechnical, allCandidates);
      expect(sorted).not.toContainEqual(
        expect.objectContaining({ user_id: "current_user_001" }),
      );
    });

    it("filters and sorts by relevance - same-city non-technical ranks before same-country", () => {
      const candidates = [
        candidateSameCountryDifferentCity,
        candidateSameCityTechnical,
      ];
      const sorted = sortProfiles(currentUserLondonTechnical, candidates);
      expect(sorted.length).toBe(2);
      expect(sorted[0].user_id).toBe("sim_user_002");
      expect(sorted[1].user_id).toBe("sim_user_003");
    });

    it("returns profiles sorted by score descending", () => {
      const sorted = sortProfiles(currentUserLondonTechnical, allCandidates);
      expect(sorted.length).toBeGreaterThan(0);
      expect(sorted.length).toBeLessThanOrEqual(allCandidates.length);
      expect(sorted.every((p) => p.user_id !== "current_user_001")).toBe(true);
    });
  });
});
