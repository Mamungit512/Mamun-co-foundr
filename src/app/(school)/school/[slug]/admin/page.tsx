"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@clerk/nextjs";
import {
  FaUserGraduate,
  FaDownload,
  FaTrash,
  FaSync,
  FaUsers,
  FaChartBar,
  FaFileCsv,
  FaHeart,
} from "react-icons/fa";
import { FaShieldAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import type { OrgConnection } from "@/app/api/school/connections/route";
import { toCsv } from "@/lib/csv";

// ─── Types ────────────────────────────────────────────────────────────────────

type Student = {
  user_id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  education: string | null;
  city: string;
  country: string;
  is_technical: boolean;
  created_at: string;
  deleted_at: string | null;
};

type Analytics = {
  total_signups: number;
  active_last_7_days: number;
  technical_count: number;
  non_technical_count: number;
  total_connections: number;
  total_messages: number;
};

type Tab = "roster" | "connections" | "analytics" | "reports";

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SchoolAdminPage() {
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("roster");

  const [students, setStudents] = useState<Student[]>([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [connections, setConnections] = useState<OrgConnection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [connectionsFetched, setConnectionsFetched] = useState(false);

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsFetched, setAnalyticsFetched] = useState(false);

  const [downloadingReport, setDownloadingReport] = useState<string | null>(
    null,
  );

  const fetchStudents = useCallback(async () => {
    if (!session) return;
    setRosterLoading(true);
    try {
      const token = await session.getToken();
      const res = await fetch("/api/school/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Forbidden");
      const data = await res.json();
      setStudents(data.students ?? []);
    } catch {
      toast.error("Failed to load students.");
    } finally {
      setRosterLoading(false);
    }
  }, [session]);

  const fetchConnections = useCallback(async () => {
    if (!session) return;
    setConnectionsLoading(true);
    try {
      const token = await session.getToken();
      const res = await fetch("/api/school/connections", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Forbidden");
      const data = await res.json();
      setConnections(data.connections ?? []);
    } catch {
      toast.error("Failed to load connections.");
    } finally {
      setConnectionsLoading(false);
      setConnectionsFetched(true);
    }
  }, [session]);

  const fetchAnalytics = useCallback(async () => {
    if (!session) return;
    setAnalyticsLoading(true);
    try {
      const token = await session.getToken();
      const res = await fetch("/api/school/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Forbidden");
      const data = await res.json();
      setAnalytics(data);
    } catch {
      toast.error("Failed to load analytics.");
    } finally {
      setAnalyticsLoading(false);
      setAnalyticsFetched(true);
    }
  }, [session]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (activeTab === "connections" && !connectionsFetched) fetchConnections();
    if (activeTab === "analytics" && !analyticsFetched) fetchAnalytics();
  }, [
    activeTab,
    connectionsFetched,
    analyticsFetched,
    fetchConnections,
    fetchAnalytics,
  ]);

  const handleDelete = async (userId: string, name: string) => {
    if (
      !confirm(
        `Permanently delete ${name}'s account and all their data? This cannot be undone.`,
      )
    )
      return;

    setDeletingId(userId);
    try {
      const token = await session?.getToken();
      const res = await fetch(
        `/api/delete-profile?targetUserId=${encodeURIComponent(userId)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Delete failed");
      setStudents((prev) => prev.filter((s) => s.user_id !== userId));
      toast.success(`${name}'s account has been deleted.`);
    } catch {
      toast.error("Failed to delete account.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "user_id",
      "first_name",
      "last_name",
      "title",
      "education",
      "city",
      "country",
      "is_technical",
      "joined",
    ];
    const rows = students
      .filter((s) => !s.deleted_at)
      .map((s) => [
        s.user_id,
        s.first_name,
        s.last_name,
        s.title ?? "",
        s.education ?? "",
        s.city,
        s.country,
        s.is_technical ? "yes" : "no",
        new Date(s.created_at).toLocaleDateString(),
      ]);
    const csv = toCsv([headers, ...rows]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Authenticated blob download for the on-demand report endpoints (they
  // require the Bearer token, so a plain <a href> won't work).
  const downloadReport = async (path: string) => {
    setDownloadingReport(path);
    try {
      const token = await session?.getToken();
      const res = await fetch(path, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res
          .headers
          .get("Content-Disposition")
          ?.match(/filename="(.+)"/)?.[1] ?? "report.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed.");
    } finally {
      setDownloadingReport(null);
    }
  };

  const activeStudents = students.filter((s) => !s.deleted_at);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "roster",
      label: "Roster",
      icon: <FaUserGraduate className="h-3.5 w-3.5" />,
    },
    {
      id: "connections",
      label: "Connections",
      icon: <FaUsers className="h-3.5 w-3.5" />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <FaChartBar className="h-3.5 w-3.5" />,
    },
    {
      id: "reports",
      label: "Reports",
      icon: <FaFileCsv className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl p-4 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaShieldAlt
            className="h-5 w-5"
            style={{ color: "var(--ui-text-muted)" }}
          />
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--ui-text)" }}
          >
            Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "roster" && (
            <>
              <button
                onClick={fetchStudents}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition"
                style={{
                  borderColor: "var(--ui-border-strong)",
                  color: "var(--ui-text-muted)",
                }}
              >
                <FaSync className="h-3 w-3" />
                Refresh
              </button>
              <button
                onClick={handleExportCSV}
                disabled={activeStudents.length === 0}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition disabled:opacity-40"
                style={{
                  borderColor: "var(--ui-border-strong)",
                  color: "var(--ui-text-muted)",
                }}
              >
                <FaDownload className="h-3 w-3" />
                Export CSV
              </button>
            </>
          )}
          {(activeTab === "connections" || activeTab === "analytics") && (
            <button
              onClick={
                activeTab === "connections" ? fetchConnections : fetchAnalytics
              }
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition"
              style={{
                borderColor: "var(--ui-border-strong)",
                color: "var(--ui-text-muted)",
              }}
            >
              <FaSync className="h-3 w-3" />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* FERPA notice */}
      <div className="mb-5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
        <strong>FERPA Notice:</strong> Student data is protected under FERPA.
        Access is restricted to authorized school administrators. Do not share
        or redistribute student records.
      </div>

      {/* Tabs */}
      <div
        className="mb-5 flex gap-1 rounded-xl border p-1"
        style={{
          borderColor: "var(--ui-border)",
          backgroundColor: "var(--ui-surface)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition"
            style={
              activeTab === tab.id
                ? {
                    backgroundColor: "var(--ui-surface-active)",
                    color: "var(--ui-text)",
                  }
                : { color: "var(--ui-text-muted)" }
            }
          >
            {tab.icon}
            {tab.label}
            {tab.id === "roster" && activeStudents.length > 0 && (
              <span
                className="rounded-full px-1.5 py-0.5 text-xs"
                style={{
                  backgroundColor: "var(--ui-surface-active)",
                  color: "var(--ui-text-muted)",
                }}
              >
                {activeStudents.length}
              </span>
            )}
            {tab.id === "connections" && connections.length > 0 && (
              <span
                className="rounded-full px-1.5 py-0.5 text-xs"
                style={{
                  backgroundColor: "var(--ui-surface-active)",
                  color: "var(--ui-text-muted)",
                }}
              >
                {connections.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Roster Tab ── */}
      {activeTab === "roster" && (
        <>
          {rosterLoading ? (
            <div className="flex justify-center py-16">
              <FaSync
                className="h-6 w-6 animate-spin"
                style={{ color: "var(--ui-text-subtle)" }}
              />
            </div>
          ) : activeStudents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FaUserGraduate
                className="h-10 w-10"
                style={{ color: "var(--ui-text-subtle)" }}
              />
              <p style={{ color: "var(--ui-text-muted)" }}>
                No students have joined yet.
              </p>
            </div>
          ) : (
            <div
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: "var(--ui-border)" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      borderColor: "var(--ui-border)",
                      backgroundColor: "var(--ui-surface)",
                    }}
                  >
                    {[
                      "Student",
                      "Education",
                      "Location",
                      "Type",
                      "Joined",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--ui-text-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeStudents.map((student, i) => (
                    <tr
                      key={student.user_id}
                      className="border-b transition"
                      style={{
                        borderColor: "var(--ui-border)",
                        backgroundColor:
                          i % 2 !== 0 ? "var(--ui-surface)" : undefined,
                      }}
                    >
                      <td className="px-4 py-3">
                        <div
                          className="font-medium"
                          style={{ color: "var(--ui-text)" }}
                        >
                          {student.first_name} {student.last_name}
                        </div>
                        {student.title && (
                          <div
                            className="text-xs"
                            style={{ color: "var(--ui-text-muted)" }}
                          >
                            {student.title}
                          </div>
                        )}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--ui-text-muted)" }}
                      >
                        {student.education ?? "—"}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--ui-text-muted)" }}
                      >
                        {student.city}, {student.country}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                            student.is_technical
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                          }`}
                        >
                          {student.is_technical ? "Technical" : "Non-technical"}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "var(--ui-text-subtle)" }}
                      >
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            handleDelete(
                              student.user_id,
                              `${student.first_name} ${student.last_name}`,
                            )
                          }
                          disabled={deletingId === student.user_id}
                          className="cursor-pointer rounded p-1.5 transition hover:bg-red-500/15 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ color: "var(--ui-text-subtle)" }}
                          title="Delete account"
                        >
                          <FaTrash className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Connections Tab ── */}
      {activeTab === "connections" && (
        <>
          {connectionsLoading ? (
            <div className="flex justify-center py-16">
              <FaSync
                className="h-6 w-6 animate-spin"
                style={{ color: "var(--ui-text-subtle)" }}
              />
            </div>
          ) : connections.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FaUsers
                className="h-10 w-10"
                style={{ color: "var(--ui-text-subtle)" }}
              />
              <p style={{ color: "var(--ui-text-muted)" }}>
                No connections yet.
              </p>
            </div>
          ) : (
            <div
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: "var(--ui-border)" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      borderColor: "var(--ui-border)",
                      backgroundColor: "var(--ui-surface)",
                    }}
                  >
                    {[
                      "User 1",
                      "User 2",
                      "Messages",
                      "Connected",
                      "Last Active",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--ui-text-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {connections.map((conn, i) => (
                    <tr
                      key={conn.conversation_id}
                      className="border-b transition"
                      style={{
                        borderColor: "var(--ui-border)",
                        backgroundColor:
                          i % 2 !== 0 ? "var(--ui-surface)" : undefined,
                      }}
                    >
                      <td className="px-4 py-3">
                        <div
                          className="font-medium"
                          style={{ color: "var(--ui-text)" }}
                        >
                          {conn.user1.first_name} {conn.user1.last_name}
                        </div>
                        {conn.user1.title && (
                          <div
                            className="text-xs"
                            style={{ color: "var(--ui-text-muted)" }}
                          >
                            {conn.user1.title}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="font-medium"
                          style={{ color: "var(--ui-text)" }}
                        >
                          {conn.user2.first_name} {conn.user2.last_name}
                        </div>
                        {conn.user2.title && (
                          <div
                            className="text-xs"
                            style={{ color: "var(--ui-text-muted)" }}
                          >
                            {conn.user2.title}
                          </div>
                        )}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--ui-text-muted)" }}
                      >
                        {conn.message_count}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "var(--ui-text-subtle)" }}
                      >
                        {new Date(conn.created_at).toLocaleDateString()}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "var(--ui-text-subtle)" }}
                      >
                        {conn.last_message_at
                          ? new Date(conn.last_message_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Analytics Tab ── */}
      {activeTab === "analytics" && (
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
                <StatCard
                  label="Total Signups"
                  value={analytics.total_signups}
                />
                <StatCard
                  label="Active (last 7 days)"
                  value={analytics.active_last_7_days}
                />
                <StatCard
                  label="Total Connections"
                  value={analytics.total_connections}
                />
                <StatCard
                  label="Total Messages"
                  value={analytics.total_messages}
                />
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
                        (analytics.technical_count / analytics.total_signups) *
                          100,
                      )}
                      %)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
                      Non-technical (
                      {Math.round(
                        (analytics.non_technical_count /
                          analytics.total_signups) *
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
      )}

      {/* ── Reports Tab ── */}
      {activeTab === "reports" && (
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
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--ui-text-muted)" }}
              >
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
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--ui-text-muted)" }}
              >
                One-sided interest rate and mutual match rate. Core proof point.
              </p>
              <button
                onClick={() =>
                  downloadReport("/api/school/reports/match-outcomes")
                }
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
      )}
    </div>
  );
}
