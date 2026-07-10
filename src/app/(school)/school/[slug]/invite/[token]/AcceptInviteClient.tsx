"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { FaHandshake, FaXmark, FaPencil } from "react-icons/fa6";

const ROLE_OPTIONS = [
  { value: "technical", label: "Technical founder" },
  { value: "non-technical", label: "Non-technical founder" },
];

type Props = {
  slug: string;
  token: string;
  inviterName: string;
  inviterTitle: string | null;
  inviterPfpUrl: string | null;
  inviteeRole: string | null;
  note: string | null;
};

export default function AcceptInviteClient({
  slug,
  token,
  inviterName,
  inviterTitle,
  inviterPfpUrl,
  inviteeRole,
  note,
}: Props) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [editingRole, setEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(inviteeRole ?? "");

  async function handleAccept() {
    setAccepting(true);
    try {
      const res = await fetch(`/api/cofounder-invite/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to accept invite");
      toast.success(`You and ${inviterName} are now linked as co-founders!`);
      router.push(`/school/${slug}/dashboard`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to accept invite");
      setAccepting(false);
    }
  }

  async function handleDecline() {
    setDeclining(true);
    try {
      const res = await fetch(`/api/cofounder-invite/${token}/decline`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to decline invite");
      toast.success("Invite declined");
      router.push(`/school/${slug}/dashboard`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to decline invite");
      setDeclining(false);
    }
  }

  const initials =
    inviterName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const displayRole =
    ROLE_OPTIONS.find((o) => o.value === selectedRole)?.label ?? selectedRole;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#e8e4dc] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          {inviterPfpUrl ? (
            <Image
              src={inviterPfpUrl}
              alt={inviterName}
              width={72}
              height={72}
              className="mx-auto mb-4 h-18 w-18 rounded-full object-cover"
            />
          ) : (
            <div
              className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full text-xl font-bold text-white"
              style={{ backgroundColor: "#bf5700", width: 72, height: 72 }}
            >
              {initials}
            </div>
          )}
          <h1 className="text-xl font-semibold" style={{ color: "#333f48" }}>
            {inviterName} invited you to link as co-founders
          </h1>
          {inviterTitle && (
            <p className="mt-1 text-sm" style={{ color: "#5f7280" }}>
              {inviterTitle}
            </p>
          )}
        </div>

        {/* Role assigned by inviter */}
        {(inviteeRole || note) && (
          <div
            className="mb-4 rounded-xl border border-[#e8e4dc] bg-[#faf8f4] px-4 py-3 space-y-1"
          >
            {inviteeRole && (
              <p className="text-sm" style={{ color: "#333f48" }}>
                Listed your role as{" "}
                <span className="font-semibold">{displayRole}</span>
              </p>
            )}
            {note && (
              <p className="text-sm italic" style={{ color: "#5f7280" }}>
                &ldquo;{note}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Edit my role toggle */}
        {!editingRole ? (
          <button
            type="button"
            onClick={() => setEditingRole(true)}
            className="mb-4 flex cursor-pointer items-center gap-1.5 text-xs font-medium transition hover:opacity-80"
            style={{ color: "#bf5700" }}
          >
            <FaPencil className="h-3 w-3" />
            Edit my role
          </button>
        ) : (
          <div className="mb-4 space-y-1.5">
            <label className="block text-xs font-medium" style={{ color: "#5f7280" }}>
              Your role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-[#e8e4dc] bg-white px-3 py-2 text-sm focus:border-[#bf5700] focus:outline-none focus:ring-1 focus:ring-[#bf5700]"
              style={{ color: "#333f48" }}
            >
              <option value="">Select a role…</option>
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <p className="mb-6 text-center text-sm" style={{ color: "#5f7280" }}>
          Accepting will link your profiles as confirmed co-founders, visible on both your cards.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDecline}
            disabled={accepting || declining}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e8e4dc] px-4 py-3 text-sm font-medium transition hover:bg-[#faf8f4] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ color: "#333f48" }}
          >
            <FaXmark className="h-3.5 w-3.5" />
            {declining ? "Declining…" : "Decline"}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={accepting || declining}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "#bf5700" }}
          >
            <FaHandshake className="h-4 w-4" />
            {accepting ? "Accepting…" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
