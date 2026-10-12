"use client";

import { useState } from "react";
import Skeleton from "@/components/ui/Skeleton";
import type { RetentionOverview } from "@/app/api/school/retention/overview/route";
import RetentionChart, { type ChartMode } from "./RetentionChart";
import { percent } from "./freshness";

type Props = {
  data: RetentionOverview | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  // Only passed when the Sources tab is reachable.
  onViewSources?: () => void;
};

const card = "rounded-xl border p-5";
const cardStyle = {
  borderColor: "var(--ui-border)",
  backgroundColor: "var(--ui-surface)",
};

function Bar({ value }: { value: number }) {
  return (
    <div
      className="mt-3 h-2 overflow-hidden rounded-full"
      style={{ backgroundColor: "var(--ui-border)" }}
      role="presentation"
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, backgroundColor: "var(--org-primary)" }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  children,
}: {
  label: string;
  value: number;
  unit?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={card} style={cardStyle}>
      <p className="text-sm" style={{ color: "var(--ui-text-muted)" }}>
        {label}
      </p>
      <p className="mt-2 flex items-baseline gap-2">
        <span
          className="text-4xl font-semibold tracking-tight"
          style={{ color: "var(--ui-text)" }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm" style={{ color: "var(--ui-text-muted)" }}>
            {unit}
          </span>
        )}
      </p>
      {children}
    </div>
  );
}

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

  if (loading && !data) return <LoadingState />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-start gap-3 py-8">
        <p className="font-medium" style={{ color: "var(--ui-text)" }}>
          We could not load the cohort numbers.
        </p>
        <p className="text-sm" style={{ color: "var(--ui-text-muted)" }}>
          Nothing is shown rather than a number we cannot stand behind. Try
          again in a moment.
        </p>
        <button
          onClick={onRetry}
          className="cursor-pointer rounded-lg border px-3.5 py-2 text-sm font-medium"
          style={{
            borderColor: "var(--ui-border-strong)",
            color: "var(--ui-text)",
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  const { reconciliation: r, connections, monthlySeries } = data;

  if (r.student_accounts === 0) {
    return (
      <div className={card} style={cardStyle}>
        <p className="font-medium" style={{ color: "var(--ui-text)" }}>
          No student accounts yet
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--ui-text-muted)" }}>
          Once students sign up with a school email you will see how many
          created an account, how many finished their profile, and where the gap
          opens up.
        </p>
      </div>
    );
  }

  const activation = percent(r.reconciled, r.student_accounts) ?? 0;
  const connected = percent(connections.students_connected, r.reconciled);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Accounts created"
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
        </StatCard>

        <StatCard
          label="Profiles completed"
          value={r.reconciled}
          unit={`${activation}% of ${r.student_accounts} accounts`}
        >
          <Bar value={activation} />
          <Caption>
            {r.ghost === 0
              ? "Every student account has a profile."
              : `${r.ghost} ${r.ghost === 1 ? "student made" : "students made"} an account and never finished onboarding.`}
          </Caption>
        </StatCard>

        <StatCard
          label="Students connected"
          value={connections.students_connected}
          unit={
            connected === null
              ? undefined
              : `${connected}% of ${r.reconciled} completed profiles`
          }
        >
          <Bar value={connected ?? 0} />
          <Caption>
            {connections.connections}{" "}
            {connections.connections === 1 ? "conversation" : "conversations"},{" "}
            {connections.messages}{" "}
            {connections.messages === 1 ? "message" : "messages"} in total.
          </Caption>
        </StatCard>
      </div>

      {r.ghost > 0 && (
        <div
          className="flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{
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
            <button
              onClick={onViewSources}
              className="shrink-0 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium"
              style={{
                backgroundColor: "var(--ui-btn-bg)",
                color: "var(--ui-btn-text)",
              }}
            >
              View the {r.ghost}
            </button>
          )}
        </div>
      )}

      <div className={card} style={cardStyle}>
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
                className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition"
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
              className="cursor-pointer font-medium"
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
