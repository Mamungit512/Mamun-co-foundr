export type LifecycleResult = {
  name: string;
  candidates: number;
  sent: number;
  skipped: number;
  failed: number;
};

export { runProfileCompletionReminders } from "./profileCompletionReminder";
