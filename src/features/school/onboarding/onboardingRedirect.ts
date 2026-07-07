const GATED_FEATURE_LABELS: Record<string, string> = {
  cofounder: "invite a co-founder",
  matches: "view your matches",
  profile: "edit your profile",
  dashboard: "access your dashboard",
  invite: "accept your invite",
};
const DEFAULT_GATED_FEATURE_LABEL = "continue";

/** Maps a `/school/{slug}/{feature}/...` redirect path to a human-readable label. */
export function getGatedFeatureLabel(path: string | null | undefined): string {
  if (!path) return DEFAULT_GATED_FEATURE_LABEL;
  const segment = path.split("?")[0].split("/").filter(Boolean)[2];
  return (segment && GATED_FEATURE_LABELS[segment]) || DEFAULT_GATED_FEATURE_LABEL;
}

/**
 * Validates a `redirect` query param against the current school before using it as a
 * post-onboarding navigation target. Falls back to the dashboard for anything outside
 * `/school/{slug}/` or pointing back into onboarding (avoids open-redirect-style bugs
 * and onboarding-to-onboarding loops).
 */
export function resolvePostOnboardingRedirect(
  slug: string,
  rawRedirect: string | null | undefined,
): string {
  const fallback = `/school/${slug}/dashboard`;
  if (!rawRedirect) return fallback;
  if (!rawRedirect.startsWith("/") || rawRedirect.startsWith("//")) return fallback;

  const schoolPrefix = `/school/${slug}`;
  if (rawRedirect !== schoolPrefix && !rawRedirect.startsWith(`${schoolPrefix}/`)) return fallback;

  const onboardingPrefix = `${schoolPrefix}/onboarding`;
  if (
    rawRedirect === onboardingPrefix ||
    rawRedirect.startsWith(`${onboardingPrefix}/`) ||
    rawRedirect.startsWith(`${onboardingPrefix}?`)
  ) {
    return fallback;
  }

  return rawRedirect;
}
