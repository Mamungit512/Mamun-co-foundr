export type LifecycleResult = {
  name: string;
  candidates: number;
  sent: number;
  skipped: number;
  failed: number;
};

export { runProfileCompletionReminders } from "./profileCompletionReminder";
export { runReEngagementReminders } from "./reEngagement";
export { runWeeklyProfileViews } from "./weeklyProfileViews";
