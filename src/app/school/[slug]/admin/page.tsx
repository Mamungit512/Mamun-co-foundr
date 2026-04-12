"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@clerk/nextjs";
import { FaUserGraduate, FaDownload, FaTrash, FaSync } from "react-icons/fa";
import { FaShieldAlt } from "react-icons/fa";
import toast from "react-hot-toast";

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

export default function SchoolAdminPage() {
  const { session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (!session) return;
    try {
      setIsLoading(true);
      const token = await session.getToken();
      const res = await fetch("/api/school/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Forbidden");
      const data = await res.json();
      setStudents(data.students ?? []);
    } catch {
      toast.error("Failed to load students. Admin access required.");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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
      const res = await fetch("/api/delete-profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

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

    const rows = students.map((s) => [
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

    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeStudents = students.filter((s) => !s.deleted_at);

  return (
    <div className="mx-auto max-w-5xl p-4 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaShieldAlt className="h-5 w-5 text-white/40" />
          <h1 className="text-xl font-semibold text-(--mist-white)">
            Student Admin
          </h1>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
            {activeStudents.length} active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStudents}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:border-white/20 hover:text-white/80"
          >
            <FaSync className="h-3 w-3" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={students.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:border-white/20 hover:text-white/80 disabled:opacity-30"
          >
            <FaDownload className="h-3 w-3" />
            Export CSV
          </button>
        </div>
      </div>

      {/* FERPA notice */}
      <div className="mb-5 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-400/80">
        <strong>FERPA Notice:</strong> Student data is protected under FERPA.
        Access is restricted to authorized school administrators. Do not share
        or redistribute student records.
      </div>

      {/* Student table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <FaSync className="h-6 w-6 animate-spin text-white/20" />
        </div>
      ) : activeStudents.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FaUserGraduate className="h-10 w-10 text-white/10" />
          <p className="text-white/40">No students have joined yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                  Education
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                  Joined
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {activeStudents.map((student, i) => (
                <tr
                  key={student.user_id}
                  className={`border-b border-white/5 transition hover:bg-white/3 ${
                    i % 2 === 0 ? "" : "bg-white/2"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-(--mist-white)">
                      {student.first_name} {student.last_name}
                    </div>
                    {student.title && (
                      <div className="text-xs text-white/40">{student.title}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {student.education ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {student.city}, {student.country}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        student.is_technical
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-purple-500/10 text-purple-400"
                      }`}
                    >
                      {student.is_technical ? "Technical" : "Non-technical"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/40">
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
                      className="rounded p-1.5 text-white/20 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
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
    </div>
  );
}
