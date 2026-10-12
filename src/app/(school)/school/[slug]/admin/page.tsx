"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@clerk/nextjs";
import { FaDownload, FaSync } from "react-icons/fa";
import toast from "react-hot-toast";
import type { OrgConnection } from "@/app/api/school/connections/route";
import type { MatchConnection } from "@/app/api/school/match-connections/route";
import { toCsv } from "@/lib/csv";
import { getCurrentCohortLabel } from "@/lib/cohort";
import {
  getAdminTabConfig,
  parseAdminTab,
  type AdminTab,
} from "@/features/school/components/admin/tabs";
import {
  toHumanLabel,
  type Analytics,
  type Student,
} from "@/features/school/components/admin/types";
import AdminPageHeader, {
  AdminSecondaryButton,
} from "@/features/school/components/admin/AdminPageHeader";
import AdminTabs from "@/features/school/components/admin/AdminTabs";
import OverviewTab from "@/features/school/components/admin/OverviewTab";
import RosterTab from "@/features/school/components/admin/RosterTab";
import ConnectionsTab, {
  type ConnectionsView,
} from "@/features/school/components/admin/ConnectionsTab";
import ReportsTab from "@/features/school/components/admin/ReportsTab";

export default function SchoolAdminPage() {
  const { session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = parseAdminTab(tabParam);

  // Normalise stale or unknown links (e.g. the retired ?tab=analytics) so the
  // address bar always names the tab on screen.
  useEffect(() => {
    if (tabParam !== null && tabParam !== activeTab) {
      router.replace(`?tab=${activeTab}`, { scroll: false });
    }
  }, [tabParam, activeTab, router]);

  const selectTab = (tab: AdminTab) => {
    if (tab !== activeTab) router.push(`?tab=${tab}`, { scroll: false });
  };

  const [students, setStudents] = useState<Student[]>([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [connectionsView, setConnectionsView] =
    useState<ConnectionsView>("matches");

  const [connections, setConnections] = useState<OrgConnection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [connectionsFetched, setConnectionsFetched] = useState(false);

  const [matchConnections, setMatchConnections] = useState<MatchConnection[]>(
    [],
  );
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesFetched, setMatchesFetched] = useState(false);
  const [matchYearFilter, setMatchYearFilter] = useState<string>("");

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

  const fetchMatchConnections = useCallback(async () => {
    if (!session) return;
    setMatchesLoading(true);
    try {
      const token = await session.getToken();
      const res = await fetch("/api/school/match-connections", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Forbidden");
      const data = await res.json();
      setMatchConnections(data.connections ?? []);
    } catch {
      toast.error("Failed to load match connections.");
    } finally {
      setMatchesLoading(false);
      setMatchesFetched(true);
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
    if (activeTab === "connections" && !matchesFetched) fetchMatchConnections();
    if (activeTab === "connections" && !connectionsFetched) fetchConnections();
    if (activeTab === "overview" && !analyticsFetched) fetchAnalytics();
  }, [
    activeTab,
    matchesFetched,
    connectionsFetched,
    analyticsFetched,
    fetchMatchConnections,
    fetchConnections,
    fetchAnalytics,
  ]);

  const matchYears = useMemo(
    () =>
      Array.from(
        new Set(
          matchConnections.map((c) => new Date(c.matched_at).getFullYear()),
        ),
      ).sort((a, b) => b - a),
    [matchConnections],
  );

  const filteredMatchConnections = useMemo(
    () =>
      matchYearFilter
        ? matchConnections.filter(
            (c) =>
              new Date(c.matched_at).getFullYear().toString() ===
              matchYearFilter,
          )
        : matchConnections,
    [matchConnections, matchYearFilter],
  );

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
        toHumanLabel(s.education) ?? "",
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
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        "report.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed.");
    } finally {
      setDownloadingReport(null);
    }
  };

  const activeStudents = students.filter((s) => !s.deleted_at);

  const tabConfig = getAdminTabConfig(activeTab);
  const subtitle =
    activeTab === "overview" ? getCurrentCohortLabel() : tabConfig.subtitle;

  const refreshConnections = () => {
    fetchMatchConnections();
    fetchConnections();
  };

  const actions =
    activeTab === "roster" ? (
      <>
        <AdminSecondaryButton onClick={fetchStudents}>
          <FaSync className="h-3 w-3" />
          Refresh
        </AdminSecondaryButton>
        <AdminSecondaryButton
          onClick={handleExportCSV}
          disabled={activeStudents.length === 0}
        >
          <FaDownload className="h-3 w-3" />
          Export CSV
        </AdminSecondaryButton>
      </>
    ) : activeTab === "connections" ? (
      <AdminSecondaryButton onClick={refreshConnections}>
        <FaSync className="h-3 w-3" />
        Refresh
      </AdminSecondaryButton>
    ) : activeTab === "overview" ? (
      <AdminSecondaryButton onClick={fetchAnalytics}>
        <FaSync className="h-3 w-3" />
        Refresh
      </AdminSecondaryButton>
    ) : null;

  return (
    <div className="mx-auto max-w-6xl p-4 pt-8">
      <AdminPageHeader
        title={tabConfig.title}
        subtitle={subtitle}
        actions={actions}
      />

      <AdminTabs
        activeTab={activeTab}
        onSelect={selectTab}
        counts={{
          roster: activeStudents.length,
          connections: matchConnections.length,
        }}
      />

      {activeTab === "overview" && (
        <OverviewTab
          analytics={analytics}
          analyticsLoading={analyticsLoading}
        />
      )}

      {activeTab === "roster" && (
        <RosterTab
          rosterLoading={rosterLoading}
          activeStudents={activeStudents}
          deletingId={deletingId}
          handleDelete={handleDelete}
        />
      )}

      {activeTab === "connections" && (
        <ConnectionsTab
          connectionsView={connectionsView}
          setConnectionsView={setConnectionsView}
          connections={connections}
          connectionsLoading={connectionsLoading}
          matchConnections={matchConnections}
          matchesLoading={matchesLoading}
          matchYearFilter={matchYearFilter}
          setMatchYearFilter={setMatchYearFilter}
          matchYears={matchYears}
          filteredMatchConnections={filteredMatchConnections}
        />
      )}

      {activeTab === "reports" && (
        <ReportsTab
          downloadingReport={downloadingReport}
          downloadReport={downloadReport}
        />
      )}
    </div>
  );
}
