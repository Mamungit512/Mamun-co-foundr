"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@clerk/nextjs";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import type { AdminLocationDto, AdminMeetupRow } from "@/features/meetups/adminTypes";
import { formatChicago } from "@/features/meetups/rules";
import { adminToast } from "../lib/adminToast";
import AdminEmptyState from "../ui/AdminEmptyState";
import { AdminPrimaryButton } from "../ui/AdminPageHeader";
import RelativeDate from "../ui/RelativeDate";
import { staggerStyle } from "../ui/AdminStatCard";
import TableSkeleton from "../ui/TableSkeleton";

type View = "locations" | "activity";
type FieldErrors = { name?: string; building?: string };

const STATUS: Record<AdminMeetupRow["status"], { label: string; className: string }> = {
  proposed: { label: "Proposed", className: "" },
  accepted: {
    label: "Confirmed",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  declined: {
    label: "Declined",
    className: "bg-red-500/15 text-red-600 dark:text-red-400",
  },
};

function StatusBadge({ status }: { status: AdminMeetupRow["status"] }) {
  const { label, className } = STATUS[status];
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}
      style={
        status === "proposed"
          ? { backgroundColor: "var(--ui-border)", color: "var(--ui-text-muted)" }
          : undefined
      }
    >
      {label}
    </span>
  );
}

function HiddenBadge() {
  return (
    <span
      className="ml-2 rounded-full px-1.5 py-0.5 text-xs font-normal"
      style={{ backgroundColor: "var(--ui-border)", color: "var(--ui-text-muted)" }}
    >
      Hidden
    </span>
  );
}

const inputClass =
  "w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--org-primary)]";
const inputStyle = {
  borderColor: "var(--ui-border-strong)",
  backgroundColor: "var(--ui-bg)",
  color: "var(--ui-text)",
};

export default function MeetupsTab() {
  const { session } = useSession();
  const [view, setView] = useState<View>("locations");

  const [locations, setLocations] = useState<AdminLocationDto[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [meetups, setMeetups] = useState<AdminMeetupRow[]>([]);
  const [meetupsLoading, setMeetupsLoading] = useState(true);

  const [name, setName] = useState("");
  const [building, setBuilding] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const call = useCallback(
    async (path: string, init?: { method: string; body?: unknown }) => {
      const token = await session?.getToken();
      if (!token) throw new Error("No authentication token");
      const res = await fetch(path, {
        method: init?.method ?? "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(init?.body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      });
      const json = await res.json().catch(() => ({}));
      return { res, json };
    },
    [session],
  );

  const loadLocations = useCallback(async () => {
    if (!session) return;
    setLocationsLoading(true);
    try {
      const { res, json } = await call("/api/school/meetup-locations");
      if (!res.ok) throw new Error();
      setLocations(json.locations ?? []);
    } catch {
      adminToast.error("Failed to load campus spots.");
    } finally {
      setLocationsLoading(false);
    }
  }, [session, call]);

  const loadMeetups = useCallback(async () => {
    if (!session) return;
    setMeetupsLoading(true);
    try {
      const { res, json } = await call("/api/school/meetups");
      if (!res.ok) throw new Error();
      setMeetups(json.meetups ?? []);
    } catch {
      adminToast.error("Failed to load meetups.");
    } finally {
      setMeetupsLoading(false);
    }
  }, [session, call]);

  useEffect(() => {
    loadLocations();
    loadMeetups();
  }, [loadLocations, loadMeetups]);

  const addLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adding) return;
    setAdding(true);
    setFieldErrors({});
    try {
      const { res, json } = await call("/api/school/meetup-locations", {
        method: "POST",
        body: { name, building },
      });
      if (res.ok) {
        setName("");
        setBuilding("");
        adminToast.success("Spot added. Students can pick it now.");
        // Reload so the list keeps the server's order.
        loadLocations();
      } else if (json.fields) {
        setFieldErrors(json.fields as FieldErrors);
      } else {
        adminToast.error(json.error ?? "Failed to add the spot.");
      }
    } catch {
      adminToast.error("Failed to add the spot.");
    } finally {
      setAdding(false);
    }
  };

  // Live immediately: the server applies it, and the list reflects the answer.
  const toggle = async (loc: AdminLocationDto) => {
    if (togglingId) return;
    setTogglingId(loc.id);
    try {
      const { res, json } = await call(`/api/school/meetup-locations/${loc.id}`, {
        method: "PATCH",
        body: { isActive: !loc.isActive },
      });
      if (!res.ok) throw new Error();
      const updated = json.location as AdminLocationDto;
      setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      adminToast.success(
        updated.isActive
          ? `${updated.name} is on.`
          : `${updated.name} is off. New requests can't pick it.`,
      );
    } catch {
      adminToast.error("Couldn't update the spot. Try again.");
    } finally {
      setTogglingId(null);
    }
  };

  const activeCount = locations.filter((l) => l.isActive).length;

  return (
    <>
      {/* Sub-toggle */}
      <div
        className="mb-4 flex w-fit gap-1 rounded-lg border p-1"
        style={{ borderColor: "var(--ui-border)", backgroundColor: "var(--ui-surface)" }}
      >
        {(
          [
            { id: "locations", label: "Locations", count: locations.length },
            { id: "activity", label: "Activity", count: meetups.length },
          ] as const
        ).map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-[background-color,transform] duration-150 hover:bg-[var(--ui-surface-active)] active:scale-95"
            style={
              view === v.id
                ? { backgroundColor: "var(--ui-surface-active)", color: "var(--ui-text)" }
                : { color: "var(--ui-text-muted)" }
            }
          >
            {v.label}
            {v.count > 0 && (
              <span
                className="ml-1.5 rounded-full px-1.5 py-0.5 text-xs"
                style={{ backgroundColor: "var(--ui-border)", color: "var(--ui-text-muted)" }}
              >
                {v.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Locations ── */}
      {view === "locations" && (
        <>
          <form
            onSubmit={addLocation}
            className="mb-6 rounded-xl border p-4"
            style={{ borderColor: "var(--ui-border)" }}
          >
            <p className="mb-3 text-sm font-medium" style={{ color: "var(--ui-text)" }}>
              Add a campus spot
            </p>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
              <div>
                <label
                  htmlFor="meetup-spot-name"
                  className="mb-1 block text-xs font-semibold tracking-wider uppercase"
                  style={{ color: "var(--ui-text-muted)" }}
                >
                  Name
                </label>
                <input
                  id="meetup-spot-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Union Main Lounge"
                  aria-invalid={!!fieldErrors.name}
                  className={inputClass}
                  style={inputStyle}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="meetup-spot-building"
                  className="mb-1 block text-xs font-semibold tracking-wider uppercase"
                  style={{ color: "var(--ui-text-muted)" }}
                >
                  Building (optional)
                </label>
                <input
                  id="meetup-spot-building"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g. Texas Union"
                  aria-invalid={!!fieldErrors.building}
                  className={inputClass}
                  style={inputStyle}
                />
                {fieldErrors.building && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.building}</p>
                )}
              </div>
              <AdminPrimaryButton type="submit" disabled={adding} className="sm:mt-5">
                {adding ? "Adding..." : "Add spot"}
              </AdminPrimaryButton>
            </div>
          </form>

          {locationsLoading && locations.length === 0 ? (
            <TableSkeleton rows={3} />
          ) : locations.length === 0 ? (
            <AdminEmptyState
              icon={FaMapMarkerAlt}
              title="No campus spots yet."
              hint="Add the approved places students can meet. Students can't propose a meetup until at least one spot is on."
            />
          ) : (
            <>
              <p className="mb-3 text-xs" style={{ color: "var(--ui-text-muted)" }}>
                {activeCount} on. Switching a spot off hides it from new requests; meetups
                that already used it keep showing it.
              </p>
              <ul
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: "var(--ui-border)" }}
              >
                {locations.map((loc, i) => (
                  <li
                    key={loc.id}
                    className="admin-enter-row flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0"
                    style={{ ...staggerStyle(i), borderColor: "var(--ui-border)" }}
                  >
                    <div className="min-w-0" style={{ opacity: loc.isActive ? 1 : 0.55 }}>
                      <p className="truncate text-sm font-medium" style={{ color: "var(--ui-text)" }}>
                        {loc.name}
                      </p>
                      {loc.building && (
                        <p className="truncate text-xs" style={{ color: "var(--ui-text-muted)" }}>
                          {loc.building}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={loc.isActive}
                      aria-label={`${loc.name}: ${loc.isActive ? "on" : "off"}`}
                      disabled={togglingId !== null}
                      onClick={() => toggle(loc)}
                      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--org-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        backgroundColor: loc.isActive
                          ? "var(--org-primary)"
                          : "var(--ui-border-strong)",
                      }}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ${
                          loc.isActive ? "translate-x-[22px]" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {/* ── Activity ── */}
      {view === "activity" && (
        <>
          {meetupsLoading && meetups.length === 0 ? (
            <TableSkeleton />
          ) : meetups.length === 0 ? (
            <AdminEmptyState
              icon={FaCalendarAlt}
              title="No meetups yet."
              hint="Meetups appear here once matched students start proposing them."
            />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="flex flex-col gap-2 md:hidden">
                {meetups.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border p-3"
                    style={{ borderColor: "var(--ui-border)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium" style={{ color: "var(--ui-text)" }}>
                        {m.proposerName} to {m.recipientName}
                      </p>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "var(--ui-text-muted)" }}>
                      {m.location.name}
                      {!m.location.isActive && <HiddenBadge />}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--ui-text-muted)" }}>
                      {formatChicago(m.startsAt)} Central
                    </p>
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
                        {["Students", "Location", "When (Central)", "Status", "Proposed"].map((h) => (
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
                      {meetups.map((m, i) => (
                        <tr
                          key={m.id}
                          className={`admin-enter-row border-b transition-colors duration-150 hover:bg-[var(--ui-surface-active)] ${
                            i % 2 !== 0 ? "bg-[var(--ui-surface)]" : ""
                          }`}
                          style={{ ...staggerStyle(i), borderColor: "var(--ui-border)" }}
                        >
                          <td className="px-4 py-3">
                            <span className="font-medium" style={{ color: "var(--ui-text)" }}>
                              {m.proposerName}
                            </span>
                            <span style={{ color: "var(--ui-text-subtle)" }}> to </span>
                            <span className="font-medium" style={{ color: "var(--ui-text)" }}>
                              {m.recipientName}
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--ui-text-muted)" }}>
                            {m.location.name}
                            {!m.location.isActive && <HiddenBadge />}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--ui-text-muted)" }}>
                            {formatChicago(m.startsAt)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={m.status} />
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--ui-text-subtle)" }}>
                            <RelativeDate iso={m.createdAt} />
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
      )}
    </>
  );
}
