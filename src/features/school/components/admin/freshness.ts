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
