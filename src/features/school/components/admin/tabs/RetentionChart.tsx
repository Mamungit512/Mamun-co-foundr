"use client";

import type { CSSProperties } from "react";
import type { MonthlyPoint } from "@/features/school/services/retention/reconcile";

export type ChartMode = "cumulative" | "monthly";

const W = 720;
const H = 300;
const M = { left: 40, right: 28, top: 24, bottom: 34 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTHS[Number(month) - 1]} ${year.slice(2)}`;
}

// Round the axis top up to a tidy number so ticks land on whole values.
export function niceMax(value: number): number {
  if (value <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(value / 4)));
  for (const mult of [1, 2, 5, 10]) {
    if (step * mult * 4 >= value) return step * mult * 4;
  }
  return value;
}

export function chartSummary(series: MonthlyPoint[]): string {
  const last = series[series.length - 1];
  if (!last) return "No student accounts yet.";
  const gap = last.accounts_total - last.profiles_total;
  return `${last.accounts_total} student accounts created, ${last.profiles_total} completed a profile, ${gap} did not.`;
}

export default function RetentionChart({
  series,
  mode,
}: {
  series: MonthlyPoint[];
  mode: ChartMode;
}) {
  const n = series.length;
  const values =
    mode === "cumulative"
      ? series.flatMap((p) => [p.accounts_total, p.profiles_total])
      : series.flatMap((p) => [p.accounts_created, p.profiles_completed]);
  const top = niceMax(Math.max(0, ...values));
  const y = (v: number) => M.top + PLOT_H - (v / top) * PLOT_H;
  const ticks = [0, 1, 2, 3, 4].map((i) => (top / 4) * i);

  // Cumulative points sit on the month; monthly groups fill equal slots.
  const slot = PLOT_W / n;
  const xLine = (i: number) =>
    n === 1 ? M.left + PLOT_W / 2 : M.left + (PLOT_W * i) / (n - 1);
  const xGroup = (i: number) => M.left + slot * i + slot / 2;
  const xAt = mode === "cumulative" ? xLine : xGroup;

  const accounts = series.map((p, i) => [xLine(i), y(p.accounts_total)]);
  const profiles = series.map((p, i) => [xLine(i), y(p.profiles_total)]);
  const path = (pts: number[][]) =>
    pts.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px},${py}`).join(" ");
  const area = `${path(accounts)} ${[...profiles]
    .reverse()
    .map(([px, py]) => `L${px},${py}`)
    .join(" ")} Z`;

  const last = series[n - 1];
  const gap = last.accounts_total - last.profiles_total;
  const barW = Math.min(26, slot / 3);

  return (
    <svg
      key={mode}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={chartSummary(series)}
      className="h-auto w-full"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={M.left}
            x2={W - M.right}
            y1={y(t)}
            y2={y(t)}
            stroke="var(--ui-border)"
          />
          <text
            x={M.left - 8}
            y={y(t) + 4}
            textAnchor="end"
            fontSize="11"
            fill="var(--ui-text-subtle)"
          >
            {Number.isInteger(t) ? t : t.toFixed(1)}
          </text>
        </g>
      ))}

      {series.map((p, i) => (
        <text
          key={p.month}
          x={xAt(i)}
          y={H - 10}
          textAnchor="middle"
          fontSize="11"
          fill="var(--ui-text-muted)"
        >
          {monthLabel(p.month)}
        </text>
      ))}

      {mode === "cumulative" ? (
        <>
          {n > 1 && (
            <path
              d={area}
              fill="var(--org-primary)"
              fillOpacity="0.14"
              className="admin-fade-late"
            />
          )}
          {n > 1 && (
            <>
              <path
                d={path(accounts)}
                pathLength={1}
                className="admin-draw"
                fill="none"
                stroke="var(--ui-text-muted)"
                strokeWidth="2"
              />
              <path
                d={path(profiles)}
                pathLength={1}
                className="admin-draw"
                fill="none"
                stroke="var(--org-primary)"
                strokeWidth="2.5"
              />
            </>
          )}
          {n === 1 && (
            <line
              x1={accounts[0][0]}
              x2={profiles[0][0]}
              y1={accounts[0][1]}
              y2={profiles[0][1]}
              stroke="var(--org-primary)"
              strokeOpacity="0.4"
              strokeWidth="10"
            />
          )}
          <circle
            cx={accounts[n - 1][0]}
            cy={accounts[n - 1][1]}
            r="4.5"
            fill="var(--ui-text-muted)"
            className="admin-fade-late"
          />
          <circle
            cx={profiles[n - 1][0]}
            cy={profiles[n - 1][1]}
            r="4.5"
            fill="var(--org-primary)"
            className="admin-fade-late"
          />
          {gap > 0 && (
            <g className="admin-fade-late">
              <text
                x={accounts[n - 1][0] - 14}
                y={(accounts[n - 1][1] + profiles[n - 1][1]) / 2 - 2}
                textAnchor="end"
                fontSize="13"
                fontWeight="600"
                fill="var(--org-primary)"
              >
                {gap} {gap === 1 ? "student" : "students"} in the gap
              </text>
              <text
                x={accounts[n - 1][0] - 14}
                y={(accounts[n - 1][1] + profiles[n - 1][1]) / 2 + 14}
                textAnchor="end"
                fontSize="11"
                fill="var(--ui-text-muted)"
              >
                signed up, never completed
              </text>
            </g>
          )}
        </>
      ) : (
        series.map((p, i) => {
          const cx = xGroup(i);
          return (
            <g key={p.month}>
              <rect
                x={cx - barW - 2}
                y={y(p.accounts_created)}
                width={barW}
                height={M.top + PLOT_H - y(p.accounts_created)}
                rx="2"
                fill="var(--ui-text-muted)"
                fillOpacity="0.55"
                className="admin-grow-y"
                style={{ "--i": i } as CSSProperties}
              />
              <rect
                x={cx + 2}
                y={y(p.profiles_completed)}
                width={barW}
                height={M.top + PLOT_H - y(p.profiles_completed)}
                rx="2"
                fill="var(--org-primary)"
                className="admin-grow-y"
                style={{ "--i": i } as CSSProperties}
              />
              {p.completion_rate !== null && (
                <text
                  x={cx}
                  y={y(Math.max(p.accounts_created, p.profiles_completed)) - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="var(--ui-text)"
                  className="admin-fade-late"
                >
                  {Math.round(p.completion_rate * 100)}%
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}
