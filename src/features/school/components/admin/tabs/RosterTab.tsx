"use client";

import { FaUserGraduate, FaTrash } from "react-icons/fa";
import { toHumanLabel, type Student } from "../lib/types";
import { staggerStyle } from "../ui/AdminStatCard";
import AdminEmptyState from "../ui/AdminEmptyState";
import RelativeDate from "../ui/RelativeDate";
import TableSkeleton from "../ui/TableSkeleton";

type Props = {
  rosterLoading: boolean;
  activeStudents: Student[];
  deletingId: string | null;
  handleDelete: (userId: string, name: string) => void;
};

export default function RosterTab({
  rosterLoading,
  activeStudents,
  deletingId,
  handleDelete,
}: Props) {
  return (
    <>
      {rosterLoading && activeStudents.length === 0 ? (
        <TableSkeleton />
      ) : activeStudents.length === 0 ? (
        <AdminEmptyState
          icon={FaUserGraduate}
          title="No students have joined yet."
          hint="Students show up here as soon as they finish onboarding."
        />
      ) : (
        <div
          className="transition-opacity duration-200"
          style={{ opacity: rosterLoading ? 0.6 : 1 }}
        >
          {/* Mobile card list */}
          <div className="flex flex-col gap-2 md:hidden">
            {activeStudents.map((student, i) => (
              <div
                key={student.user_id}
                className="admin-enter-row rounded-xl border p-3"
                style={{ ...staggerStyle(i), borderColor: "var(--ui-border)" }}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
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
                  </div>
                  <button
                    onClick={() =>
                      handleDelete(
                        student.user_id,
                        `${student.first_name} ${student.last_name}`,
                      )
                    }
                    disabled={deletingId === student.user_id}
                    className="shrink-0 cursor-pointer rounded p-1.5 transition-[background-color,color,transform] duration-150 hover:bg-red-500/15 hover:text-red-500 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                    style={{ color: "var(--ui-text-subtle)" }}
                    title="Delete account"
                  >
                    <FaTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                  style={{ color: "var(--ui-text-muted)" }}
                >
                  <span>{toHumanLabel(student.education) ?? "—"}</span>
                  <span>
                    {student.city}, {student.country}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 font-medium whitespace-nowrap ${
                      student.is_technical
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {student.is_technical ? "Technical" : "Non-technical"}
                  </span>
                  <span style={{ color: "var(--ui-text-subtle)" }}>
                    Joined <RelativeDate iso={student.created_at} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div
            className="hidden overflow-hidden rounded-xl border md:block"
            style={{ borderColor: "var(--ui-border)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
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
                        className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
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
                        {toHumanLabel(student.education) ?? "—"}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--ui-text-muted)" }}
                      >
                        {student.city}, {student.country}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
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
                        <RelativeDate iso={student.created_at} />
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
                          className="cursor-pointer rounded p-1.5 transition-[background-color,color,transform] duration-150 hover:bg-red-500/15 hover:text-red-500 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
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
          </div>
        </div>
      )}
    </>
  );
}
