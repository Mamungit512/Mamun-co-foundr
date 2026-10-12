"use client";

import { FaDownload, FaSync, FaUsers, FaHeart } from "react-icons/fa";

type Props = {
  downloadingReport: string | null;
  downloadReport: (path: string) => void;
};

export default function ReportsTab({
  downloadingReport,
  downloadReport,
}: Props) {
  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: "var(--ui-text-muted)" }}>
        Generate CSV snapshots of the current cohort and matching outcomes on
        demand. Each export reflects live data at the moment you download it.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Active cohort report */}
        <div
          className="flex flex-col rounded-xl border p-5"
          style={{
            borderColor: "var(--ui-border)",
            backgroundColor: "var(--ui-surface)",
          }}
        >
          <div
            className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--ui-surface-active)" }}
          >
            <FaUsers
              className="h-4 w-4"
              style={{ color: "var(--ui-text-muted)" }}
            />
          </div>
          <h3
            className="text-base font-semibold"
            style={{ color: "var(--ui-text)" }}
          >
            Active cohort report
          </h3>
          <p className="mt-1 text-sm" style={{ color: "var(--ui-text-muted)" }}>
            Full snapshot of the current cohort. Includes:
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              "School",
              "Founder archetype",
              "Graduation year",
              "Industry / Interest",
              "Student or Alumni",
            ].map((chip) => (
              <span
                key={chip}
                className="rounded-md px-2 py-1 text-xs font-medium"
                style={{
                  backgroundColor: "var(--ui-surface-active)",
                  color: "var(--ui-text-muted)",
                }}
              >
                {chip}
              </span>
            ))}
          </div>
          <button
            onClick={() => downloadReport("/api/school/reports/cohort")}
            disabled={downloadingReport !== null}
            className="mt-4 flex w-fit cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: "var(--ui-btn-bg)",
              color: "var(--ui-btn-text)",
            }}
          >
            {downloadingReport === "/api/school/reports/cohort" ? (
              <FaSync className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FaDownload className="h-3.5 w-3.5" />
            )}
            Export CSV
          </button>
        </div>

        {/* We Match outcomes */}
        <div
          className="flex flex-col rounded-xl border p-5"
          style={{
            borderColor: "var(--ui-border)",
            backgroundColor: "var(--ui-surface)",
          }}
        >
          <div
            className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--ui-surface-active)" }}
          >
            <FaHeart
              className="h-4 w-4"
              style={{ color: "var(--ui-text-muted)" }}
            />
          </div>
          <h3
            className="text-base font-semibold"
            style={{ color: "var(--ui-text)" }}
          >
            We Match outcomes
          </h3>
          <p className="mt-1 text-sm" style={{ color: "var(--ui-text-muted)" }}>
            One-sided interest rate and mutual match rate. Core proof point.
          </p>
          <button
            onClick={() => downloadReport("/api/school/reports/match-outcomes")}
            disabled={downloadingReport !== null}
            className="mt-auto flex w-fit cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: "var(--ui-btn-bg)",
              color: "var(--ui-btn-text)",
            }}
          >
            {downloadingReport === "/api/school/reports/match-outcomes" ? (
              <FaSync className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FaDownload className="h-3.5 w-3.5" />
            )}
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
