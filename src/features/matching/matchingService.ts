// -----------------------------------------
// Matching Service
//
// Everything related to the relevance sorting algorithm. Assigns weight to categories and gives two profiles a compatibility score depending on how many fields match
//
// -----------------------------------------

// --- Weight Distribution ---
// Determines which categories are more important for the algorithm
const weightDistribution = {
  // Preference-based weights (highest priority)
  preferenceMatch: 8,
  locationPreference: 6,

  // Similarity weights (complementary to preferences)
  technicalMatch: 5,
  city: 4,
  country: 3,
  sharedInterest: 3,
  startupExperience: 2,

  // Complementarity weights (opposite of similarity)
  complementarySkills: 4,
  differentInterests: 2,
};

// --- Helper Functions ---
// Binary Match : If two values match, returns a value of 1. Else returns 0
export function binaryMatch(a: string, b: string) {
  return a?.toLowerCase() === b?.toLowerCase() ? 1 : 0;
}

// Array Overlap Score : Compares arrays of valies (e.g. priority areas, interests, etc)
export function arrayOverlapScore(arr1: string[] = [], arr2: string[] = []) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  let matches = 0;
  set1.forEach((item) => {
    if (set2.has(item)) matches++;
  });
  return matches;
}

// Preference Match : Checks if candidate matches user's preferences
export function preferenceMatch(
  userPreferences: { lookingFor?: string; preferredLocation?: string },
  candidateProfile: OnboardingData,
) {
  let score = 0;

  // Technical preference matching
  if (userPreferences.lookingFor) {
    const candidateIsTechnical = candidateProfile.isTechnical === "yes";

    switch (userPreferences.lookingFor) {
      case "technical":
        if (candidateIsTechnical) score += 1;
        break;
      case "non-technical":
        if (!candidateIsTechnical) score += 1;
        break;
      case "either":
        score += 0.5; // Neutral preference gets partial score
        break;
    }
  }

  return score;
}

// Location Preference Match : Checks if candidate matches location preferences
export function locationPreferenceMatch(
  userPreferences: { preferredLocation?: string },
  candidateProfile: OnboardingData,
  currentUser: OnboardingData,
) {
  if (!userPreferences.preferredLocation) return 0;

  const sameCity = currentUser.city === candidateProfile.city;
  const sameCountry = currentUser.country === candidateProfile.country;

  switch (userPreferences.preferredLocation) {
    case "same-city":
      return sameCity ? 1 : 0;
    case "same-country":
      return sameCountry ? 1 : 0;
    case "remote":
      return 0.5; // Remote work gets neutral score
    default:
      return 0;
  }
}

// Complementarity Score : Measures how well profiles complement each other
export function complementarityScore(
  currentUser: OnboardingData,
  candidateProfile: OnboardingData,
) {
  let score = 0;

  // Technical complementarity (opposite technical backgrounds can be complementary)
  if (currentUser.isTechnical !== candidateProfile.isTechnical) {
    score += 1;
  }

  // Skill complementarity (different responsibilities)
  const userResponsibilities = currentUser.responsibilities || [];
  const candidateResponsibilities = candidateProfile.responsibilities || [];

  if (userResponsibilities.length > 0 && candidateResponsibilities.length > 0) {
    const overlap = arrayOverlapScore(
      userResponsibilities,
      candidateResponsibilities,
    );
    const totalUnique = new Set([
      ...userResponsibilities,
      ...candidateResponsibilities,
    ]).size;

    // Higher score for complementary skills (some overlap but not complete)
    const complementarityRatio = 1 - overlap / totalUnique;
    score += complementarityRatio;
  }

  // Interest diversity (some shared interests but also different ones)
  const userInterests = currentUser.priorityAreas || [];
  const candidateInterests = candidateProfile.priorityAreas || [];

  if (userInterests.length > 0 && candidateInterests.length > 0) {
    const overlap = arrayOverlapScore(userInterests, candidateInterests);
    const totalUnique = new Set([...userInterests, ...candidateInterests]).size;

    // Optimal balance: some shared interests (0.3-0.7 ratio)
    const sharedRatio = overlap / totalUnique;
    if (sharedRatio >= 0.3 && sharedRatio <= 0.7) {
      score += 1;
    } else if (sharedRatio > 0.7) {
      score += 0.5; // Too similar
    } else {
      score += 0.3; // Too different
    }
  }

  return score;
}

// --- Scoring ---
function scoreCandidate(
  userProfile: OnboardingData,
  currentUser: OnboardingData,
) {
  let score = 0;

  // 1. PREFERENCE-BASED SCORING (Highest Priority)
  const userPreferences = {
    lookingFor: currentUser.lookingFor,
    preferredLocation: currentUser.preferredLocation,
  };

  // Technical preference match
  const preferenceScore = preferenceMatch(userPreferences, userProfile);
  score += preferenceScore * weightDistribution.preferenceMatch;

  // Location preference match
  const locationPreferenceScore = locationPreferenceMatch(
    userPreferences,
    userProfile,
    currentUser,
  );
  score += locationPreferenceScore * weightDistribution.locationPreference;

  // 2. SIMILARITY SCORING (Complementary to preferences)

  // Technical similarity (only if preferences allow it)
  if (preferenceScore > 0) {
    const technicalSimilarity =
      currentUser.isTechnical === userProfile.isTechnical ? 1 : 0;
    score += technicalSimilarity * weightDistribution.technicalMatch;
  }

  // Location similarity (only if location preferences allow it)
  if (locationPreferenceScore > 0) {
    score +=
      binaryMatch(currentUser.city!, userProfile.city!) *
      weightDistribution.city;
    score +=
      binaryMatch(currentUser.country!, userProfile.country!) *
      weightDistribution.country;
  }

  // Shared interests (always valuable for compatibility)
  score +=
    arrayOverlapScore(currentUser.priorityAreas, userProfile.priorityAreas) *
    weightDistribution.sharedInterest;

  // Startup experience similarity
  score +=
    binaryMatch(currentUser.hasStartup!, userProfile.hasStartup!) *
    weightDistribution.startupExperience;

  // 3. COMPLEMENTARITY SCORING (Balances similarity)

  // Skill complementarity
  const complementarity = complementarityScore(currentUser, userProfile);
  score += complementarity * weightDistribution.complementarySkills;

  // Interest diversity (some shared but not identical interests)
  const userInterests = currentUser.priorityAreas || [];
  const candidateInterests = userProfile.priorityAreas || [];

  if (userInterests.length > 0 && candidateInterests.length > 0) {
    const overlap = arrayOverlapScore(userInterests, candidateInterests);
    const totalUnique = new Set([...userInterests, ...candidateInterests]).size;
    const sharedRatio = overlap / totalUnique;

    // Reward optimal diversity (not too similar, not too different)
    let diversityScore = 0;
    if (sharedRatio >= 0.3 && sharedRatio <= 0.7) {
      diversityScore = 1;
    } else if (sharedRatio > 0.7) {
      diversityScore = 0.5; // Too similar
    } else {
      diversityScore = 0.3; // Too different
    }

    score += diversityScore * weightDistribution.differentInterests;
  }

  return score;
}

// --- Filtering ---
// Filter Profiles : Filter profiles based on user preferences
export function filterProfilesByPreferences(
  profiles: OnboardingData[],
  currentUser: OnboardingData,
) {
  const userPreferences = {
    lookingFor: currentUser.lookingFor,
    preferredLocation: currentUser.preferredLocation,
  };

  const filtered = profiles.filter((profile) => {
    // Skip if no preferences set
    if (!userPreferences.lookingFor && !userPreferences.preferredLocation) {
      return true;
    }

    // Technical preference filtering
    if (userPreferences.lookingFor) {
      const candidateIsTechnical = profile.isTechnical === "yes";

      switch (userPreferences.lookingFor) {
        case "technical":
          if (!candidateIsTechnical) {
            console.log(`❌ Filtered out ${profile.firstName} - not technical`);
            return false;
          }
          break;
        case "non-technical":
          if (candidateIsTechnical) {
            console.log(`❌ Filtered out ${profile.firstName} - is technical`);
            return false;
          }
          break;
        case "either":
          // No filtering for "either"
          break;
      }
    }

    // Location preference filtering
    if (userPreferences.preferredLocation) {
      const sameCity = currentUser.city === profile.city;
      const sameCountry = currentUser.country === profile.country;

      switch (userPreferences.preferredLocation) {
        case "same-city":
          if (!sameCity) {
            console.log(`❌ Filtered out ${profile.firstName} - not same city`);
            return false;
          }
          break;
        case "same-country":
          if (!sameCountry) {
            console.log(
              `❌ Filtered out ${profile.firstName} - not same country`,
            );
            return false;
          }
          break;
        case "remote":
          // No filtering for "remote"
          break;
      }
    }

    return true;
  });

  return filtered;
}

// --- Sorting by relevance ---
// Sort Profiles : Sort fetched profiles based on algorithm
export function sortProfiles(
  currentUser: OnboardingData,
  profiles: OnboardingData[],
) {
  // Filter out current user's profile in case it got through the getProfiles service function.
  const profilesWithoutCurrentUser = profiles.filter(
    (profile) => profile.user_id !== currentUser.user_id,
  );

  // Then filter by preferences
  const filteredProfiles = filterProfilesByPreferences(
    profilesWithoutCurrentUser,
    currentUser,
  );

  // Then score and sort
  return filteredProfiles
    .map((profile) => {
      const score = scoreCandidate(profile, currentUser);
      return { profile, score };
    })
    .sort((a, b) => b.score - a.score) // descending: best match first
    .map((item) => item.profile); // return only profiles
}
