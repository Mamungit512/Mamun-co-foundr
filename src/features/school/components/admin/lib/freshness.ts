export type FreshnessInfo = { label: string; stale: boolean };

// Plain-language age of the Clerk data. Stale means older than the cache TTL,
// which only happens when a refresh failed and old data was served.
export function describeFreshness(
  fetchedAt: string,
  staleAfterSeconds: number,
  now: Date = new Date(),
): FreshnessInfo {
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - new Date(fetchedAt).getTime()) / 1000),
  );
  const minutes = Math.floor(seconds / 60);
  let label: string;
  if (minutes < 1) label = "just now";
  else if (minutes < 60)
    label = `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  else {
    const hours = Math.floor(minutes / 60);
    label = `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  return { label, stale: seconds > staleAfterSeconds };
}

export function percent(part: number, whole: number): number | null {
  return whole === 0 ? null : Math.round((part / whole) * 100);
}

const RELATIVE_CUTOFF_DAYS = 14;

// Compact age for table cells: "just now", "2m ago", "3h ago", "5d ago".
// Anything older than two weeks reads better as a date.
export function formatRelativeTime(
  iso: string,
  now: Date = new Date(),
): string {
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - new Date(iso).getTime()) / 1000),
  );
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < RELATIVE_CUTOFF_DAYS) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
