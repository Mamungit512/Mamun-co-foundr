/**
 * Activity Tracking Utility Functions
 * Helper functions for formatting and checking user activity status
 */

export type ActivityStatus = 'active' | 'recent' | 'inactive';

/**
 * Formats a timestamp into a human-readable "time ago" string
 * @param timestamp ISO string or null
 * @returns Formatted string like "2 hours ago", "3 days ago", etc.
 */
export function formatLastActive(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Never';

  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();

  // If in the future or invalid, return "Just now"
  if (diffMs < 0) return 'Just now';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Checks if a user is considered active based on a threshold
 * @param lastActiveAt ISO timestamp string or null
 * @param thresholdDays Number of days to consider inactive (default: 30)
 * @returns Boolean indicating if user is active
 */
export function isUserActive(
  lastActiveAt: string | null | undefined,
  thresholdDays: number = 30
): boolean {
  if (!lastActiveAt) return false;

  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  const diffMs = now.getTime() - lastActive.getTime();
  const diffDays = diffMs / 86400000;

  return diffDays <= thresholdDays;
}

/**
 * Gets a categorical activity status for a user
 * @param lastActiveAt ISO timestamp string or null
 * @returns 'active', 'recent', or 'inactive'
 */
export function getActivityStatus(lastActiveAt: string | null | undefined): ActivityStatus {
  if (!lastActiveAt) return 'inactive';

  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  const diffMs = now.getTime() - lastActive.getTime();
  const diffHours = diffMs / 3600000;
  const diffDays = diffMs / 86400000;

  if (diffHours < 24) return 'active'; // Active today
  if (diffDays < 7) return 'recent'; // Active this week
  return 'inactive'; // Inactive for over a week
}

/**
 * Gets a display-friendly activity indicator
 * @param lastActiveAt ISO timestamp string or null
 * @returns Object with label and color for UI display
 */
export function getActivityIndicator(lastActiveAt: string | null | undefined): {
  label: string;
  color: 'green' | 'yellow' | 'gray';
  dotColor: string;
} {
  const status = getActivityStatus(lastActiveAt);

  switch (status) {
    case 'active':
      return {
        label: 'Active today',
        color: 'green',
        dotColor: 'bg-green-500',
      };
    case 'recent':
      return {
        label: 'Active this week',
        color: 'yellow',
        dotColor: 'bg-yellow-500',
      };
    case 'inactive':
    default:
      return {
        label: formatLastActive(lastActiveAt),
        color: 'gray',
        dotColor: 'bg-gray-400',
      };
  }
}
