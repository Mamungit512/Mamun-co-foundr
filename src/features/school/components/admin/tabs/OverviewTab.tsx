"use client";

import { useState } from "react";
import { FaUserGraduate } from "react-icons/fa";
import Skeleton from "@/components/ui/Skeleton";
import type { RetentionOverview } from "@/app/api/school/retention/overview/route";
import RetentionChart, { type ChartMode } from "./RetentionChart";
import { percent } from "../lib/freshness";
import { overviewViewState } from "../lib/overviewState";
import {
  AdminPrimaryButton,
  AdminSecondaryButton,
} from "../ui/AdminPageHeader";
import AdminEmptyState from "../ui/AdminEmptyState";
import AdminStatCard, {
  AdminBar,
  adminCard as card,
  adminCardStyle as cardStyle,
  staggerStyle,
} from "../ui/AdminStatCard";

type Props = {
  data: RetentionOverview | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  // Only passed when the Sources tab is reachable.
  onViewSources?: () => void;
};

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-xs" style={{ color: "var(--ui-text-muted)" }}>
      {children}
    </p>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={card} style={cardStyle}>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-10 w-20" />
            <Skeleton className="mt-4 h-3 w-full" />
          </div>
        ))}
      </div>
      <div className={card} style={cardStyle}>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    </div>
  );
}

export default function OverviewTab({
  data,
  loading,
  error,
  onRetry,
  onViewSources,
}: Props) {
  const [mode, setMode] = useState<ChartMode>("cumulative");

  const view = overviewViewState(data, loading, error);

  if (view === "loading") return <LoadingState />;

  if (view === "error" || !data) {
    return (
      <div className="flex flex-col items-start gap-3 py-8">
        <p className="font-medium" style={{ color: "var(--ui-text)" }}>
          We could not load the cohort numbers.
        </p>
        <p className="text-sm" style={{ color: "var(--ui-text-muted)" }}>
          Nothing is shown rather than a number we cannot stand behind. Try
          again in a moment.
        </p>
        <AdminSecondaryButton onClick={onRetry}>Try again</AdminSecondaryButton>
      </div>
    );
  }

  const { reconciliation: r, matches, monthlySeries } = data;

  if (view === "empty") {
    return (
      <div className={card} style={cardStyle}>
        <AdminEmptyState
          compact
          icon={FaUserGraduate}
          title="No student accounts yet"
          hint="Once students sign up with a school email you will see how many created an account, how many finished their profile, and where the gap opens up."
        />
      </div>
    );
  }

  const activation = percent(r.reconciled, r.student_accounts) ?? 0;
  const matched = percent(matches.students_matched, r.reconciled);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          label="Accounts created"
          index={0}
          value={r.student_accounts}
          unit="students, all time"
        >
          <p className="mt-3 flex gap-4 text-sm">
            <span style={{ color: "var(--ui-text-muted)" }}>
              <strong style={{ color: "var(--ui-text)" }}>
                {r.reconciled}
              </strong>{" "}
              completed a profile
            </span>
            <span style={{ color: "var(--ui-text-muted)" }}>
              <strong style={{ color: "var(--org-primary)" }}>{r.ghost}</strong>{" "}
              did not
            </span>
          </p>
        </AdminStatCard>

        <AdminStatCard
          label="Profiles completed"
          index={1}
          value={r.reconciled}
          unit={`${activation}% of ${r.student_accounts} accounts`}
        >
          <AdminBar value={activation} />
          <Caption>
            {r.ghost === 0
              ? "Every student account has a profile."
              : `${r.ghost} ${r.ghost === 1 ? "student made" : "students made"} an account and never finished onboarding.`}
          </Caption>
        </AdminStatCard>

        <AdminStatCard
          label="Students matched"
          index={2}
          value={matches.students_matched}
          unit={
            matched === null
              ? undefined
              : `${matched}% of ${r.reconciled} completed profiles`
          }
        >
          <AdminBar value={matched ?? 0} />
          <Caption>
            {matches.matched_pairs}{" "}
            {matches.matched_pairs === 1 ? "matched pair" : "matched pairs"} (
            {matches.linked_pairs} linked, {matches.mutual_pairs} mutual).
          </Caption>
        </AdminStatCard>
      </div>

      {r.ghost > 0 && (
        <div
          className="admin-enter flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{
            ...staggerStyle(3),
            borderColor: "var(--org-primary)",
            backgroundColor: "var(--ui-surface-active)",
          }}
        >
          <div>
            <p className="font-semibold" style={{ color: "var(--ui-text)" }}>
              {r.ghost} {r.ghost === 1 ? "student has" : "students have"} an
              account but no profile
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--ui-text-muted)" }}
            >
              They signed up and never finished onboarding, so they cannot be
              matched yet.
            </p>
          </div>
          {onViewSources && (
            <AdminPrimaryButton onClick={onViewSources} className="shrink-0">
              View the {r.ghost}
            </AdminPrimaryButton>
          )}
        </div>
      )}

      <div
        className={`admin-enter ${card}`}
        style={{ ...cardStyle, ...staggerStyle(4) }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--ui-text)" }}
            >
              Where students are lost
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--ui-text-muted)" }}
            >
              Clerk records the signup. Our database only records a student once
              onboarding is finished. The gap is the program&apos;s leak.
            </p>
          </div>
          <div
            className="flex w-fit shrink-0 gap-1 rounded-lg border p-1"
            style={{ borderColor: "var(--ui-border)" }}
          >
            {(
              [
                { id: "cumulative", label: "Cumulative" },
                { id: "monthly", label: "New per month" },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                onClick={() => setMode(option.id)}
                aria-pressed={mode === option.id}
                className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-[background-color,transform] duration-150 hover:bg-[var(--ui-surface)] active:scale-95"
                style={
                  mode === option.id
                    ? {
                        backgroundColor: "var(--ui-surface-active)",
                        color: "var(--ui-text)",
                      }
                    : { color: "var(--ui-text-muted)" }
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <RetentionChart series={monthlySeries} mode={mode} />
        </div>

        <div
          className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs"
          style={{
            borderColor: "var(--ui-border)",
            color: "var(--ui-text-muted)",
          }}
        >
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-0.5 w-4"
                style={{ backgroundColor: "var(--ui-text-muted)" }}
              />
              {mode === "cumulative" ? "Accounts created" : "New accounts"}
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-0.5 w-4"
                style={{ backgroundColor: "var(--org-primary)" }}
              />
              {mode === "cumulative" ? "Profiles completed" : "New profiles"}
            </span>
            {mode === "monthly" && (
              <span>
                % shows how many of that month&apos;s accounts have completed a
                profile today
              </span>
            )}
          </div>
          {onViewSources && (
            <button
              onClick={onViewSources}
              className="cursor-pointer font-medium underline-offset-4 hover:underline"
              style={{ color: "var(--org-primary)" }}
            >
              Reconcile the sources
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
