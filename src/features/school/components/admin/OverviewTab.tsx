"use client";

import { FaSync, FaChartBar } from "react-icons/fa";
import type { Analytics } from "./types";

// Interim Overview: the retired Analytics tab's content, shown until the
// retention metrics (build plan Phase 4) replace it.

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4">
      <p className="text-xs font-medium text-[var(--ui-text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--ui-text)]">
        {value}
      </p>
    </div>
  );
}

type Props = {
  analytics: Analytics | null;
  analyticsLoading: boolean;
};

export default function OverviewTab({ analytics, analyticsLoading }: Props) {
  return (
    <>
      {analyticsLoading ? (
        <div className="flex justify-center py-16">
          <FaSync
            className="h-6 w-6 animate-spin"
            style={{ color: "var(--ui-text-subtle)" }}
          />
        </div>
      ) : !analytics ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FaChartBar
            className="h-10 w-10"
            style={{ color: "var(--ui-text-subtle)" }}
          />
          <p style={{ color: "var(--ui-text-muted)" }}>
            No analytics data available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Profiles" value={analytics.total_signups} />
            <StatCard
              label="Active (last 7 days)"
              value={analytics.active_last_7_days}
            />
            <StatCard
              label="Total Connections"
              value={analytics.total_connections}
            />
            <StatCard label="Total Messages" value={analytics.total_messages} />
            <StatCard
              label="Technical Founders"
              value={analytics.technical_count}
            />
            <StatCard
              label="Non-Technical Founders"
              value={analytics.non_technical_count}
            />
          </div>

          {analytics.total_signups > 0 && (
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: "var(--ui-border)",
                backgroundColor: "var(--ui-surface)",
              }}
            >
              <p
                className="mb-3 text-xs font-medium"
                style={{ color: "var(--ui-text-muted)" }}
              >
                Technical split
              </p>
              <div
                className="flex h-2.5 overflow-hidden rounded-full"
                style={{ backgroundColor: "var(--ui-border)" }}
              >
                <div
                  className="bg-blue-500 transition-all"
                  style={{
                    width: `${(analytics.technical_count / analytics.total_signups) * 100}%`,
                  }}
                />
                <div
                  className="bg-purple-500 transition-all"
                  style={{
                    width: `${(analytics.non_technical_count / analytics.total_signups) * 100}%`,
                  }}
                />
              </div>
              <div
                className="mt-2.5 flex gap-4 text-xs"
                style={{ color: "var(--ui-text-muted)" }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                  Technical (
                  {Math.round(
                    (analytics.technical_count / analytics.total_signups) * 100,
                  )}
                  %)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
                  Non-technical (
                  {Math.round(
                    (analytics.non_technical_count / analytics.total_signups) *
                      100,
                  )}
                  %)
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
