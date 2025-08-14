// -----------------------------------------
// Matching Service
//
// Everything related to the relevance sorting algorithm. Assigns weight to categories and gives two profiles a compatibility score depending on how many fields match
//
// -----------------------------------------

// --- Weight Distribution ---
// Determines which categories are more important for the algorithm
const weightDistribution = {
  technicalMatch: 5,
  city: 4,
  country: 3,
  sharedInterest: 3,
  startupExperience: 2,
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

// --- Scoring ---
function scoreCandidate(
  userProfile: OnboardingData,
  currentUser: OnboardingData,
) {
  let score = 0;

  // Technical match
  if (currentUser.isTechnical && userProfile.isTechnical) {
    score +=
      currentUser.isTechnical === userProfile.isTechnical
        ? weightDistribution.technicalMatch
        : 0;
  }

  // Location match
  score +=
    binaryMatch(currentUser.city!, userProfile.city!) * weightDistribution.city;
  score +=
    binaryMatch(currentUser.country!, userProfile.country!) *
    weightDistribution.country;

  // Shared interests
  score +=
    arrayOverlapScore(currentUser.priorityAreas, userProfile.priorityAreas) *
    weightDistribution.sharedInterest;

  // Startup experience
  score +=
    binaryMatch(currentUser.hasStartup!, userProfile.hasStartup!) *
    weightDistribution.startupExperience;

  return score;
}

// --- Sorting by relevance ---
// Sort Profiles : Sort fetched profiles based on algorithm
export function sortProfiles(
  currentUser: OnboardingData,
  profiles: OnboardingData[],
) {
  return profiles
    .map((profile) => {
      // Use the existing scoring helper
      const score = scoreCandidate(profile, currentUser);
      console.log({ profile, score }); // TO REMOVE -> TEMPORARILY KEEP FOR TESTING PURPOSES
      return { profile, score };
    })
    .sort((a, b) => b.score - a.score) // descending: best match first
    .map((item) => item.profile); // return only profiles
}
