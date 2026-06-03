import type { OrgOnboarding } from "@/features/school/registry/types";

export function getCompletedSteps(
  data: OnboardingData,
  visited: Set<number>,
  onboarding: OrgOnboarding,
): Set<number> {
  const completed = new Set<number>();

  if (data.pfp_url) completed.add(1);

  const step2Ok = onboarding.step2RequiredFields.every(
    (field) => Boolean(data[field]),
  );
  if (step2Ok) completed.add(2);

  if (onboarding.step3Completion) {
    if (onboarding.step3Completion(data)) completed.add(3);
  }

  // Steps beyond the field-validated ones are complete when visited
  const visitedFrom = onboarding.step3Completion ? 4 : 3;
  for (let i = visitedFrom; i <= onboarding.totalSteps; i++) {
    if (visited.has(i)) completed.add(i);
  }

  return completed;
}
