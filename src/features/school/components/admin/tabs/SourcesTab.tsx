"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@clerk/nextjs";
import { FaCheckCircle, FaDownload, FaSync } from "react-icons/fa";
import Skeleton from "@/components/ui/Skeleton";
import type { RetentionOverview } from "@/app/api/school/retention/overview/route";
import type { GhostRow } from "@/app/api/school/retention/ghosts/route";
import { adminToast } from "../lib/adminToast";
import {
  AdminPrimaryButton,
  AdminSecondaryButton,
} from "../ui/AdminPageHeader";
import AdminEmptyState from "../ui/AdminEmptyState";
import AdminStatCard, {
  adminCard as card,
  adminCardStyle as cardStyle,
  staggerStyle,
} from "../ui/AdminStatCard";

const GHOST_EXPORT_PATH = "/api/school/reports/ghost-accounts";

type Props = {
  data: RetentionOverview | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  downloadingReport: string | null;
  downloadReport: (path: string) => void;
  // Bump to reload the ghost list, e.g. after a refresh.
  refreshKey?: number;
};

type GhostPage = { rows: GhostRow[]; total: number; pageSize: number };

type BucketRow = {
  name: string;
  meaning: string;
  count: number;
  owner: string;
  highlight?: boolean;
};

export default function SourcesTab({
  data,
  loading,
  error,
  onRetry,
  downloadingReport,
  downloadReport,
  refreshKey = 0,
}: Props) {
  const { session } = useSession();
  const [page, setPage] = useState(0);
  const [ghosts, setGhosts] = useState<GhostPage | null>(null);
  const [ghostsLoading, setGhostsLoading] = useState(true);
  const [ghostsError, setGhostsError] = useState(false);

  const fetchGhosts = useCallback(async () => {
    if (!session) return;
    setGhostsLoading(true);
    setGhostsError(false);
    try {
      const token = await session.getToken();
      const res = await fetch(`/api/school/retention/ghosts?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      setGhosts(await res.json());
    } catch {
      setGhostsError(true);
      adminToast.error("Failed to load ghost accounts.");
    } finally {
      setGhostsLoading(false);
    }
  }, [session, page]);

  useEffect(() => {
    fetchGhosts();
  }, [fetchGhosts, refreshKey]);

  if (loading && !data) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className={card} style={cardStyle}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-10 w-16" />
              <Skeleton className="mt-4 h-3 w-full" />
            </div>
          ))}
        </div>
        <div className={card} style={cardStyle}>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-start gap-3 py-8">
        <p className="font-medium" style={{ color: "var(--ui-text)" }}>
          We could not load the source numbers.
        </p>
        <AdminSecondaryButton onClick={onRetry}>Try again</AdminSecondaryButton>
      </div>
    );
  }

  const r = data.reconciliation;
  const buckets: BucketRow[] = [
    {
      name: "Reconciled",
      meaning: "A student account with a completed profile. The real roster.",
      count: r.reconciled,
      owner: "None needed",
    },
    {
      name: "Ghost",
      meaning:
        "Signed up but never finished onboarding. They do not appear in matching.",
      count: r.ghost,
      owner: "Program staff",
      highlight: r.ghost > 0,
    },
    {
      name: "Orphan",
      meaning:
        "A profile whose account was deleted. It may still appear in match results.",
      count: r.orphan,
      owner: "Platform team",
      highlight: r.orphan > 0,
    },
    {
      name: "Staff",
      meaning: "Admin accounts. Left out of every student number.",
      count: r.staff_accounts,
      owner: "None needed",
    },
  ];

  const totalGhosts = ghosts?.total ?? 0;
  const pageSize = ghosts?.pageSize ?? 25;
  const from = totalGhosts === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalGhosts);
  const exporting = downloadingReport === GHOST_EXPORT_PATH;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          labelVariant="caps"
          index={0}
          label="Clerk"
          value={r.student_accounts + r.staff_accounts}
          unit="accounts for this school"
        >
          {r.student_accounts}{" "}
          {r.student_accounts === 1 ? "student" : "students"} plus{" "}
          {r.staff_accounts} staff. Overview counts the students only.
        </AdminStatCard>
        <AdminStatCard
          labelVariant="caps"
          index={1}
          label="Completed profiles"
          value={r.completed_profiles}
          unit="finished onboarding"
        >
          {r.reconciled} {r.reconciled === 1 ? "student" : "students"}, plus{" "}
          {r.staff_with_profile} staff and {r.orphan} from deleted accounts.
          Overview counts the students only.
        </AdminStatCard>
        <AdminStatCard
          labelVariant="caps"
          index={2}
          label="Old dashboard said"
          value={r.legacy_total_signups}
          unit={'labelled "Total Signups"'}
          highlight
        >
          It counted profile rows only, so it missed students who never finished
          and could include accounts that were since deleted.
        </AdminStatCard>
      </div>

      <div
        className={`admin-enter ${card}`}
        style={{ ...cardStyle, ...staggerStyle(3) }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--ui-text)" }}
        >
          Reconciliation
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--ui-text-muted)" }}>
          Every account and profile is matched to the other, in both directions,
          so neither side can quietly drift.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr
                className="border-b text-left text-xs font-semibold tracking-wider uppercase"
                style={{
                  borderColor: "var(--ui-border)",
                  color: "var(--ui-text-muted)",
                }}
              >
                <th className="py-2 pr-4">Bucket</th>
                <th className="py-2 pr-4">What it means</th>
                <th className="py-2 pr-4 text-right">Count</th>
                <th className="py-2">Who acts</th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((b, i) => (
                <tr
                  key={b.name}
                  className="admin-enter-row border-b transition-colors duration-150 hover:bg-[var(--ui-surface)]"
                  style={{
                    ...staggerStyle(i),
                    borderColor: "var(--ui-border)",
                    backgroundColor: b.highlight
                      ? "var(--ui-surface-active)"
                      : undefined,
                  }}
                >
                  <td
                    className="py-3 pr-4 pl-2 font-medium"
                    style={{ color: "var(--ui-text)" }}
                  >
                    {b.name}
                  </td>
                  <td
                    className="py-3 pr-4"
                    style={{ color: "var(--ui-text-muted)" }}
                  >
                    {b.meaning}
                  </td>
                  <td
                    className="py-3 pr-4 text-right text-base font-semibold"
                    style={{ color: "var(--ui-text)" }}
                  >
                    {b.count}
                  </td>
                  <td
                    className="py-3"
                    style={{ color: "var(--ui-text-muted)" }}
                  >
                    {b.owner}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  className="py-3 pr-4 pl-2 font-medium"
                  style={{ color: "var(--ui-text)" }}
                >
                  Student accounts
                </td>
                <td
                  className="py-3 pr-4"
                  style={{ color: "var(--ui-text-muted)" }}
                >
                  Reconciled plus ghost. The base for every percentage on
                  Overview.
                </td>
                <td
                  className="py-3 pr-4 text-right text-base font-semibold"
                  style={{ color: "var(--ui-text)" }}
                >
                  {r.student_accounts}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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
              Ghost accounts
              {ghosts && (
                <span
                  className="ml-2 font-normal"
                  style={{ color: "var(--ui-text-muted)" }}
                >
                  {totalGhosts}
                </span>
              )}
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--ui-text-muted)" }}
            >
              Students with an account and no profile, oldest first.
            </p>
          </div>
          <AdminPrimaryButton
            onClick={() => downloadReport(GHOST_EXPORT_PATH)}
            disabled={downloadingReport !== null || totalGhosts === 0}
            className="shrink-0"
          >
            {exporting ? (
              <FaSync className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FaDownload className="h-3.5 w-3.5" />
            )}
            Export CSV
          </AdminPrimaryButton>
        </div>

        {ghostsLoading && !ghosts ? (
          <Skeleton className="mt-4 h-40 w-full" />
        ) : ghostsError && !ghosts ? (
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span style={{ color: "var(--ui-text-muted)" }}>
              Could not load the list.
            </span>
            <button
              onClick={fetchGhosts}
              className="cursor-pointer font-medium"
              style={{ color: "var(--org-primary)" }}
            >
              Try again
            </button>
          </div>
        ) : totalGhosts === 0 ? (
          <div className="mt-4">
            <AdminEmptyState
              compact
              icon={FaCheckCircle}
              title="No ghost accounts"
              hint="Every student account has a profile."
            />
          </div>
        ) : (
          <>
            <div
              className="mt-4 overflow-x-auto transition-opacity duration-200"
              style={{ opacity: ghostsLoading ? 0.5 : 1 }}
            >
              <table
                key={ghosts?.rows[0]?.clerk_user_id}
                className="w-full min-w-[520px] text-sm"
              >
                <thead>
                  <tr
                    className="border-b text-left text-xs font-semibold tracking-wider uppercase"
                    style={{
                      borderColor: "var(--ui-border)",
                      color: "var(--ui-text-muted)",
                    }}
                  >
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Account created</th>
                    <th className="py-2 pr-4 text-right">Days since</th>
                    <th className="py-2 pl-4">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {ghosts?.rows.map((g, i) => (
                    <tr
                      key={g.clerk_user_id}
                      className="admin-enter-row border-b transition-colors duration-150 hover:bg-[var(--ui-surface)]"
                      style={{
                        ...staggerStyle(i),
                        borderColor: "var(--ui-border)",
                      }}
                    >
                      <td
                        className="py-3 pr-4 font-medium"
                        style={{ color: "var(--ui-text)" }}
                      >
                        {g.masked_email}
                      </td>
                      <td
                        className="py-3 pr-4"
                        style={{ color: "var(--ui-text-muted)" }}
                      >
                        {new Date(g.clerk_created_at).toLocaleDateString()}
                      </td>
                      <td
                        className="py-3 pr-4 text-right"
                        style={{ color: "var(--ui-text-muted)" }}
                      >
                        {g.days_since_created}
                      </td>
                      <td className="py-3 pl-4">
                        {g.has_main_site_profile && (
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: "var(--ui-surface-active)",
                              color: "var(--ui-text-muted)",
                            }}
                            title="Onboarded on the main site, not this school portal"
                          >
                            Has a main-site profile
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className="mt-3 flex items-center justify-between text-xs"
              style={{ color: "var(--ui-text-muted)" }}
            >
              <span>
                Showing {from} to {to} of {totalGhosts}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || ghostsLoading}
                  className="cursor-pointer rounded-md border px-3 py-1.5 font-medium transition-[background-color,transform] duration-150 hover:bg-[var(--ui-surface)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
                  style={{ borderColor: "var(--ui-border-strong)" }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={to >= totalGhosts || ghostsLoading}
                  className="cursor-pointer rounded-md border px-3 py-1.5 font-medium transition-[background-color,transform] duration-150 hover:bg-[var(--ui-surface)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
                  style={{ borderColor: "var(--ui-border-strong)" }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        <p className="mt-4 text-xs" style={{ color: "var(--ui-text-subtle)" }}>
          Emails are masked here. The CSV contains full emails, is restricted
          under FERPA, and every export is recorded against your admin account.
        </p>
      </div>
    </div>
  );
}
