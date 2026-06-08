"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { FaHandshake, FaXmark } from "react-icons/fa6";

type Props = {
  slug: string;
  token: string;
  inviterName: string;
  inviterTitle: string | null;
  inviterPfpUrl: string | null;
};

export default function AcceptInviteClient({
  slug,
  token,
  inviterName,
  inviterTitle,
  inviterPfpUrl,
}: Props) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  async function handleAccept() {
    setAccepting(true);
    try {
      const res = await fetch(`/api/cofounder-invite/${token}/accept`, { method: "POST" });
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

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
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
            <p className="mt-1 text-sm" style={{ color: "#9cadb7" }}>
              {inviterTitle}
            </p>
          )}
        </div>

        <p className="mb-6 text-center text-sm" style={{ color: "#9cadb7" }}>
          Accepting will link your profiles as confirmed co-founders, visible on both your cards.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDecline}
            disabled={accepting || declining}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e8e4dc] px-4 py-3 text-sm font-medium transition hover:bg-[#faf8f4] disabled:opacity-50"
            style={{ color: "#333f48" }}
          >
            <FaXmark className="h-3.5 w-3.5" />
            {declining ? "Declining…" : "Decline"}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={accepting || declining}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
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
