/**
 * "meetups-v1" rollout switch. Server-only: reads MEETUPS_V1_ORGS, a
 * comma-separated list of school slugs (e.g. "ut"). Unset or empty means off
 * for every school. Client components get the result through the school
 * layout (useSchool().features.meetups), never by reading the env var.
 */
export function isMeetupsEnabled(orgSlug: string | null | undefined): boolean {
  if (!orgSlug) return false;
  const enabled = (process.env.MEETUPS_V1_ORGS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return enabled.includes(orgSlug.trim().toLowerCase());
}
