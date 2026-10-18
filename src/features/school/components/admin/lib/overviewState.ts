import type { RetentionOverview } from "@/app/api/school/retention/overview/route";

export type OverviewViewState = "loading" | "error" | "empty" | "ready";

// Which of the Overview's four screens to show. Kept pure so the empty and
// error rules are tested without rendering.
export function overviewViewState(
  data: RetentionOverview | null,
  loading: boolean,
  error: boolean,
): OverviewViewState {
  if (loading && !data) return "loading";
  if (error || !data) return "error";
  if (data.reconciliation.student_accounts === 0) return "empty";
  return "ready";
}
