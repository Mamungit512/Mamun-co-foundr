"use client";

import { FaUserGraduate, FaTrash, FaSync } from "react-icons/fa";
import { toHumanLabel, type Student } from "./types";

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
        <>
          {/* Mobile card list */}
          <div className="flex flex-col gap-2 md:hidden">
            {activeStudents.map((student) => (
              <div
                key={student.user_id}
                className="rounded-xl border p-3"
                style={{ borderColor: "var(--ui-border)" }}
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
                    className="shrink-0 cursor-pointer rounded p-1.5 transition hover:bg-red-500/15 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
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
                    Joined {new Date(student.created_at).toLocaleDateString()}
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
                          className="cursor-pointer rounded p-1.5 transition hover:bg-red-500/15 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
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
        </>
      )}
    </>
  );
}
