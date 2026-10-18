"use client";

import { FaUsers, FaLink, FaHandshake, FaClock } from "react-icons/fa";
import type { OrgConnection } from "@/app/api/school/connections/route";
import type { MatchConnection } from "@/app/api/school/match-connections/route";
import { staggerStyle } from "../ui/AdminStatCard";
import AdminEmptyState from "../ui/AdminEmptyState";
import RelativeDate from "../ui/RelativeDate";
import TableSkeleton from "../ui/TableSkeleton";

export type ConnectionsView = "matches" | "conversations";

type Props = {
  connectionsView: ConnectionsView;
  setConnectionsView: (view: ConnectionsView) => void;
  connections: OrgConnection[];
  connectionsLoading: boolean;
  matchConnections: MatchConnection[];
  matchesLoading: boolean;
  matchYearFilter: string;
  setMatchYearFilter: (year: string) => void;
  matchYears: number[];
  filteredMatchConnections: MatchConnection[];
};

export default function ConnectionsTab({
  connectionsView,
  setConnectionsView,
  connections,
  connectionsLoading,
  matchConnections,
  matchesLoading,
  matchYearFilter,
  setMatchYearFilter,
  matchYears,
  filteredMatchConnections,
}: Props) {
  return (
    <>
      {/* Sub-toggle */}
      <div
        className="mb-4 flex w-fit gap-1 rounded-lg border p-1"
        style={{
          borderColor: "var(--ui-border)",
          backgroundColor: "var(--ui-surface)",
        }}
      >
        {(
          [
            { id: "matches", label: "Matches" },
            { id: "conversations", label: "Conversations" },
          ] as const
        ).map((view) => (
          <button
            key={view.id}
            onClick={() => setConnectionsView(view.id)}
            className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-[background-color,transform] duration-150 hover:bg-[var(--ui-surface-active)] active:scale-95"
            style={
              connectionsView === view.id
                ? {
                    backgroundColor: "var(--ui-surface-active)",
                    color: "var(--ui-text)",
                  }
                : { color: "var(--ui-text-muted)" }
            }
          >
            {view.label}
            {view.id === "matches" && matchConnections.length > 0 && (
              <span
                className="ml-1.5 rounded-full px-1.5 py-0.5 text-xs"
                style={{
                  backgroundColor: "var(--ui-border)",
                  color: "var(--ui-text-muted)",
                }}
              >
                {matchConnections.length}
              </span>
            )}
            {view.id === "conversations" && connections.length > 0 && (
              <span
                className="ml-1.5 rounded-full px-1.5 py-0.5 text-xs"
                style={{
                  backgroundColor: "var(--ui-border)",
                  color: "var(--ui-text-muted)",
                }}
              >
                {connections.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Matches view ── */}
      {connectionsView === "matches" && (
        <>
          {matchesLoading && matchConnections.length === 0 ? (
            <TableSkeleton />
          ) : matchConnections.length === 0 ? (
            <AdminEmptyState
              icon={FaHandshake}
              title="No matches or links yet."
              hint="Matches appear here as students connect through the platform."
            />
          ) : (
            <div
              className="transition-opacity duration-200"
              style={{ opacity: matchesLoading ? 0.6 : 1 }}
            >
              <div className="mb-3 flex justify-end">
                <select
                  value={matchYearFilter}
                  onChange={(e) => setMatchYearFilter(e.target.value)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                  style={{
                    borderColor: "var(--ui-border)",
                    backgroundColor: "var(--ui-surface)",
                    color: "var(--ui-text)",
                  }}
                >
                  <option value="">All years</option>
                  {matchYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const nameOf = (p: MatchConnection["person1"]): string => {
                  if (p.first_name || p.last_name)
                    return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
                  return p.email ?? "Unknown";
                };

                const StatusBadge = ({ conn }: { conn: MatchConnection }) => {
                  if (conn.kind === "linked")
                    return (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <FaLink className="h-2.5 w-2.5" />
                        Linked
                      </span>
                    );
                  if (conn.kind === "mutual")
                    return (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <FaHandshake className="h-2.5 w-2.5" />
                        Mutual
                      </span>
                    );
                  return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/15 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                      <FaClock className="h-2.5 w-2.5" />
                      Pending
                    </span>
                  );
                };

                const TypeBadge = ({
                  p,
                }: {
                  p: MatchConnection["person1"];
                }) => {
                  if (p.is_technical === null) return null;
                  return (
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
                        p.is_technical
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                      }`}
                    >
                      {p.is_technical ? "Tech" : "Non-tech"}
                    </span>
                  );
                };

                const teamOf = (conn: MatchConnection) => {
                  const teamName =
                    conn.person1.startup_name ?? conn.person2.startup_name;
                  const teamWebsite =
                    conn.person1.startup_website ??
                    conn.person2.startup_website;
                  return { teamName, teamWebsite };
                };

                return (
                  <>
                    {/* Mobile card list */}
                    <div className="flex flex-col gap-2 md:hidden">
                      {filteredMatchConnections.map((conn, i) => {
                        const { teamName, teamWebsite } = teamOf(conn);
                        return (
                          <div
                            key={conn.id}
                            className="admin-enter-row rounded-xl border p-3"
                            style={{
                              ...staggerStyle(i),
                              borderColor: "var(--ui-border)",
                            }}
                          >
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <div>
                                <div
                                  className="font-medium"
                                  style={{ color: "var(--ui-text)" }}
                                >
                                  {nameOf(conn.person1)}
                                </div>
                                <div
                                  className="text-xs"
                                  style={{ color: "var(--ui-text-muted)" }}
                                >
                                  × {nameOf(conn.person2)}
                                </div>
                              </div>
                              <StatusBadge conn={conn} />
                            </div>
                            <div
                              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                              style={{ color: "var(--ui-text-muted)" }}
                            >
                              <div className="flex flex-wrap gap-1">
                                <TypeBadge p={conn.person1} />
                                <TypeBadge p={conn.person2} />
                              </div>
                              {teamName &&
                                (teamWebsite ? (
                                  <a
                                    href={teamWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium hover:underline"
                                    style={{ color: "var(--ui-text)" }}
                                  >
                                    {teamName}
                                  </a>
                                ) : (
                                  <span className="font-medium">
                                    {teamName}
                                  </span>
                                ))}
                              <span style={{ color: "var(--ui-text-subtle)" }}>
                                <RelativeDate iso={conn.matched_at} />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop table */}
                    <div
                      className="hidden overflow-hidden rounded-xl border md:block"
                      style={{ borderColor: "var(--ui-border)" }}
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-sm">
                          <thead>
                            <tr
                              className="border-b"
                              style={{
                                borderColor: "var(--ui-border)",
                                backgroundColor: "var(--ui-surface)",
                              }}
                            >
                              {[
                                "Match",
                                "Type Fit",
                                "Team",
                                "Date",
                                "Status",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
                                  style={{ color: "var(--ui-text-muted)" }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMatchConnections.map((conn, i) => {
                              return (
                                <tr
                                  key={conn.id}
                                  className={`admin-enter-row border-b transition-colors duration-150 hover:bg-[var(--ui-surface-active)] ${
                                    i % 2 !== 0 ? "bg-[var(--ui-surface)]" : ""
                                  }`}
                                  style={{
                                    ...staggerStyle(i),
                                    borderColor: "var(--ui-border)",
                                  }}
                                >
                                  <td className="px-4 py-3">
                                    <div
                                      className="font-medium"
                                      style={{ color: "var(--ui-text)" }}
                                    >
                                      {nameOf(conn.person1)}
                                    </div>
                                    <div
                                      className="text-xs"
                                      style={{ color: "var(--ui-text-muted)" }}
                                    >
                                      × {nameOf(conn.person2)}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                      <TypeBadge p={conn.person1} />
                                      <TypeBadge p={conn.person2} />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    {(() => {
                                      const teamName =
                                        conn.person1.startup_name ??
                                        conn.person2.startup_name;
                                      const teamWebsite =
                                        conn.person1.startup_website ??
                                        conn.person2.startup_website;
                                      if (!teamName) {
                                        return (
                                          <span
                                            style={{
                                              color: "var(--ui-text-muted)",
                                            }}
                                          >
                                            —
                                          </span>
                                        );
                                      }
                                      if (teamWebsite) {
                                        return (
                                          <a
                                            href={teamWebsite}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium hover:underline"
                                            style={{ color: "var(--ui-text)" }}
                                          >
                                            {teamName}
                                          </a>
                                        );
                                      }
                                      return (
                                        <div
                                          className="font-medium"
                                          style={{ color: "var(--ui-text)" }}
                                        >
                                          {teamName}
                                        </div>
                                      );
                                    })()}
                                  </td>
                                  <td
                                    className="px-4 py-3 text-xs"
                                    style={{ color: "var(--ui-text-subtle)" }}
                                  >
                                    <RelativeDate iso={conn.matched_at} />
                                  </td>
                                  <td className="px-4 py-3">
                                    <StatusBadge conn={conn} />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* ── Conversations view ── */}
      {connectionsView === "conversations" && (
        <>
          {connectionsLoading && connections.length === 0 ? (
            <TableSkeleton />
          ) : connections.length === 0 ? (
            <AdminEmptyState
              icon={FaUsers}
              title="No conversations yet."
              hint="Conversations show up here once matched students start messaging."
            />
          ) : (
            <div
              className="overflow-hidden rounded-xl border transition-opacity duration-200"
              style={{
                borderColor: "var(--ui-border)",
                opacity: connectionsLoading ? 0.6 : 1,
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
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
                          className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
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
                        className={`admin-enter-row border-b transition-colors duration-150 hover:bg-[var(--ui-surface-active)] ${
                          i % 2 !== 0 ? "bg-[var(--ui-surface)]" : ""
                        }`}
                        style={{
                          ...staggerStyle(i),
                          borderColor: "var(--ui-border)",
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
                          <RelativeDate iso={conn.created_at} />
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "var(--ui-text-subtle)" }}
                        >
                          {conn.last_message_at ? (
                            <RelativeDate iso={conn.last_message_at} />
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
