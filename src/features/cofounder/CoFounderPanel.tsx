"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { FaUserPlus, FaTrash, FaUserMinus, FaPaperPlane, FaRotateRight } from "react-icons/fa6";
import {
  useCofounderManagement,
  useSendCofounderInvite,
  useRevokeCofounderInvite,
  useResendCofounderInvite,
  useUnlinkCofounder,
  type CofounderInvite,
} from "./hooks";
import { formatAllowedDomainsForCopy } from "@/features/school/auth/email-domain";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  revoked: "Revoked",
  expired: "Expired",
};

const ROLE_OPTIONS = [
  { value: "technical", label: "Technical founder" },
  { value: "non-technical", label: "Non-technical founder" },
];

function effectiveStatus(invite: CofounderInvite): CofounderInvite["status"] {
  if (invite.status === "pending" && new Date(invite.expires_at) < new Date()) {
    return "expired";
  }
  return invite.status;
}

export default function CoFounderPanel({
  allowedDomains = [],
}: {
  slug: string;
  allowedDomains?: string[];
}) {
  const [email, setEmail] = useState("");
  const [startupName, setStartupName] = useState("");
  const [startupWebsite, setStartupWebsite] = useState("");
  const [role, setRole] = useState("");
  const [note, setNote] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const { data, isLoading } = useCofounderManagement();
  const sendInvite = useSendCofounderInvite();
  const revokeInvite = useRevokeCofounderInvite();
  const resendInvite = useResendCofounderInvite();
  const unlink = useUnlinkCofounder();

  const pendingInvites = (data?.invites ?? []).filter((i) => effectiveStatus(i) === "pending");
  const pastInvites = (data?.invites ?? []).filter((i) => effectiveStatus(i) !== "pending");
  const links = data?.links ?? [];

  const emailPlaceholder = `cofounder@${allowedDomains[0] ?? "utexas.edu"}`;
  const allowedDomainsCopy = formatAllowedDomainsForCopy(allowedDomains);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    const trimmedStartupName = startupName.trim();
    if (!trimmed || !trimmedStartupName) return;
    try {
      await sendInvite.mutateAsync({
        inviteeEmail: trimmed,
        startupName: trimmedStartupName,
        startupWebsite: startupWebsite.trim() || undefined,
        inviteeRole: role || undefined,
        note: note.trim() || undefined,
      });
      toast.success(`Invite sent to ${trimmed}`);
      setEmail("");
      setStartupName("");
      setStartupWebsite("");
      setRole("");
      setNote("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invite");
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this invite?")) return;
    try {
      await revokeInvite.mutateAsync(id);
      toast.success("Invite revoked");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke");
    }
  }

  async function handleResend(token: string) {
    try {
      await resendInvite.mutateAsync(token);
      toast.success("Invite re-sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend invite");
    }
  }

  async function handleReinvite(invite: CofounderInvite) {
    if (!invite.startup_name) {
      setEmail(invite.invitee_email);
      setStartupWebsite(invite.startup_website ?? "");
      setRole(invite.invitee_role ?? "");
      setNote(invite.note ?? "");
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast("Add the startup name to re-send this invite", { icon: "✏️" });
      return;
    }
    try {
      await sendInvite.mutateAsync({
        inviteeEmail: invite.invitee_email,
        startupName: invite.startup_name,
        startupWebsite: invite.startup_website ?? undefined,
        inviteeRole: invite.invitee_role ?? undefined,
        note: invite.note ?? undefined,
      });
      toast.success(`Invite re-sent to ${invite.invitee_email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to re-invite");
    }
  }

  async function handleUnlink(linkId: string, name: string) {
    if (!confirm(`Remove ${name} as your co-founder?`)) return;
    try {
      await unlink.mutateAsync(linkId);
      toast.success(`Unlinked from ${name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unlink");
    }
  }

  const sectionClass =
    "rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 space-y-5";
  const labelClass = "block text-sm font-medium text-[var(--ui-text-muted)]";

  return (
    <section id="co-founder" className={sectionClass}>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--ui-text-muted)]">
        Co-Founders
      </h2>

      {/* Linked co-founders */}
      {links.length > 0 && (
        <div className="space-y-3">
          <label className={labelClass}>Linked co-founders</label>
          {links.map((link) => {
            const name = [link.first_name, link.last_name].filter(Boolean).join(" ") || "Co-founder";
            return (
              <div
                key={link.link_id}
                className="flex items-center gap-3 rounded-xl border border-[var(--ui-border)] px-4 py-3"
              >
                {link.pfp_url ? (
                  <Image
                    src={link.pfp_url}
                    alt={name}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ui-surface-active)] text-sm font-semibold text-[var(--ui-text)]">
                    {(link.first_name?.[0] ?? "").toUpperCase()}{(link.last_name?.[0] ?? "").toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--ui-text)]">{name}</p>
                  {link.title && (
                    <p className="truncate text-xs text-[var(--ui-text-muted)]">{link.title}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleUnlink(link.link_id, name)}
                  disabled={unlink.isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  <FaUserMinus className="h-3 w-3" />
                  Unlink
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Send invite form */}
      <div className="space-y-2">
        <label className={labelClass}>Invite a co-founder</label>
        <p className="text-xs text-[var(--ui-text-subtle)]">
          Enter their school email address — they&apos;ll receive a link to accept.
          {allowedDomainsCopy && ` Must be a ${allowedDomainsCopy} email.`}
        </p>
        <form ref={formRef} onSubmit={handleSend} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={emailPlaceholder}
            className="w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] focus:border-[var(--ui-border-strong)] focus:outline-none focus:ring-1 focus:ring-[var(--ui-border)]"
            required
          />
          <input
            type="text"
            value={startupName}
            onChange={(e) => setStartupName(e.target.value)}
            placeholder="Startup or project name"
            className="w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] focus:border-[var(--ui-border-strong)] focus:outline-none focus:ring-1 focus:ring-[var(--ui-border)]"
            required
          />
          <input
            type="url"
            value={startupWebsite}
            onChange={(e) => setStartupWebsite(e.target.value)}
            placeholder="https://yourstartup.com (optional)"
            className="w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] focus:border-[var(--ui-border-strong)] focus:outline-none focus:ring-1 focus:ring-[var(--ui-border)]"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-sm text-[var(--ui-text)] focus:border-[var(--ui-border-strong)] focus:outline-none focus:ring-1 focus:ring-[var(--ui-border)]"
          >
            <option value="">Their role (optional)</option>
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for them… (optional)"
            rows={2}
            className="w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] focus:border-[var(--ui-border-strong)] focus:outline-none focus:ring-1 focus:ring-[var(--ui-border)] resize-none"
          />
          <button
            type="submit"
            disabled={sendInvite.isPending || !email.trim() || !startupName.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--ui-btn-bg)] px-4 py-2 text-sm font-medium text-[var(--ui-btn-text)] transition hover:bg-[#a34800] disabled:opacity-50"
          >
            <FaUserPlus className="h-3.5 w-3.5" />
            {sendInvite.isPending ? "Sending…" : "Send invite"}
          </button>
        </form>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <label className={labelClass}>Pending invites</label>
          {pendingInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--ui-border)] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-[var(--ui-text)]">{invite.invitee_email}</p>
                <p className="text-xs text-[var(--ui-text-subtle)]">
                  Expires {new Date(invite.expires_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResend(invite.token)}
                  disabled={resendInvite.isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--ui-border)] px-3 py-1.5 text-xs text-[var(--ui-text-muted)] transition hover:border-[var(--ui-border-strong)] hover:text-[var(--ui-text)] disabled:opacity-50"
                >
                  <FaPaperPlane className="h-3 w-3" />
                  Resend
                </button>
                <button
                  type="button"
                  onClick={() => handleRevoke(invite.token)}
                  disabled={revokeInvite.isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--ui-border)] px-3 py-1.5 text-xs text-[var(--ui-text-muted)] transition hover:border-red-500/30 hover:text-red-500 disabled:opacity-50"
                >
                  <FaTrash className="h-3 w-3" />
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past invites */}
      {pastInvites.length > 0 && (
        <div className="space-y-2">
          <label className={labelClass}>Past invites</label>
          {pastInvites.map((invite) => {
            const status = effectiveStatus(invite);
            const canReinvite = status === "revoked" || status === "declined" || status === "expired";
            return (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--ui-border)] px-4 py-3 opacity-60"
              >
                <p className="truncate text-sm text-[var(--ui-text)]">{invite.invitee_email}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--ui-text-subtle)]">
                    {STATUS_LABELS[status] ?? status}
                  </span>
                  {canReinvite && (
                    <button
                      type="button"
                      onClick={() => handleReinvite(invite)}
                      disabled={sendInvite.isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-[var(--ui-border)] px-3 py-1.5 text-xs text-[var(--ui-text-muted)] transition hover:border-[var(--ui-border-strong)] hover:text-[var(--ui-text)] disabled:opacity-50"
                    >
                      <FaRotateRight className="h-3 w-3" />
                      Re-invite
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && links.length === 0 && pendingInvites.length === 0 && (
        <p className="text-xs text-[var(--ui-text-subtle)]">
          No co-founders linked yet. Send an invite above to get started.
        </p>
      )}
    </section>
  );
}
