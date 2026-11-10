"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import { useSchool } from "@/features/school/components/SchoolContext";
import { MeetupApiError } from "./meetupsService";
import { MEETUP_NOTE_MAX, validateProposal, type ProposalErrors } from "./rules";
import { useMeetupLocations, useProposeMeetup } from "./useMeetups";

type FormValues = { locationId: string; startsAtLocal: string; note: string };
const EMPTY: FormValues = { locationId: "", startsAtLocal: "", note: "" };

const LABEL = "mb-1.5 block text-[10px] font-semibold tracking-wider uppercase text-[var(--ui-text-muted)]";
const FIELD =
  "w-full rounded-xl border border-[var(--ui-border)] bg-white px-3 py-2.5 text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] focus:border-[var(--org-primary)] focus:outline-none";
const ERROR = "mt-1 text-xs text-red-600";

export default function ProposeMeetupModal({
  open,
  onClose,
  otherUserId,
  otherName,
}: {
  open: boolean;
  onClose: () => void;
  otherUserId: string;
  /** "Ethan C." */
  otherName: string;
}) {
  const { orgId } = useSchool();
  const { data: locations, isLoading: locationsLoading } = useMeetupLocations(open);
  const propose = useProposeMeetup(otherUserId);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: EMPTY });

  // The form opens empty every time, including after a decline or a cancel.
  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const noteLength = Array.from(watch("note") ?? "").length;

  const showFieldErrors = (fields: ProposalErrors) => {
    if (fields.location) setError("locationId", { message: fields.location });
    if (fields.startsAt) setError("startsAtLocal", { message: fields.startsAt });
    if (fields.note) setError("note", { message: fields.note });
  };

  const onSubmit = async (values: FormValues) => {
    // Same rules the server applies, so the messages match. The server still decides.
    const chosen = locations?.find((l) => l.id === values.locationId);
    const check = validateProposal({
      location: chosen ? { id: chosen.id, organizationId: orgId, isActive: true } : null,
      organizationId: orgId,
      startsAtLocal: values.startsAtLocal,
      note: values.note,
      now: new Date(),
    });
    if (!check.ok) {
      showFieldErrors(check.errors);
      return;
    }

    try {
      await propose.mutateAsync(values);
      toast.success(`Meetup request sent to ${otherName}.`);
      onClose();
    } catch (err) {
      if (err instanceof MeetupApiError && err.fields) {
        showFieldErrors(err.fields);
      } else {
        toast.error(
          err instanceof MeetupApiError
            ? err.message
            : "Couldn't send the request. Please try again.",
        );
        // A 409 or 403 means the card is out of date; the hook already refetched.
        if (err instanceof MeetupApiError && (err.status === 409 || err.status === 403)) {
          onClose();
        }
      }
    }
  };

  const noSpots = !locationsLoading && (locations?.length ?? 0) === 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="propose-meetup-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-[var(--ui-popover-bg)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[var(--org-primary)] px-6 py-4 text-white">
              <p className="text-[10px] font-semibold tracking-wider uppercase opacity-80">
                Propose a meetup
              </p>
              <h2 id="propose-meetup-title" className="text-lg font-bold">
                With {otherName}
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 p-6">
              <div>
                <label htmlFor="meetup-location" className={LABEL}>
                  Location · approved campus spots
                </label>
                <select
                  id="meetup-location"
                  autoFocus
                  disabled={locationsLoading || noSpots}
                  aria-invalid={!!errors.locationId}
                  className={FIELD}
                  {...register("locationId")}
                >
                  <option value="">
                    {locationsLoading ? "Loading spots..." : "Choose a spot"}
                  </option>
                  {(locations ?? []).map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.building ? `${l.name} (${l.building})` : l.name}
                    </option>
                  ))}
                </select>
                {noSpots && (
                  <p className="mt-1 text-xs text-[var(--ui-text-muted)]">
                    No meetup spots are set up yet.
                  </p>
                )}
                {errors.locationId && <p className={ERROR}>{errors.locationId.message}</p>}
              </div>

              <div>
                <label htmlFor="meetup-when" className={LABEL}>
                  Date and time · Central
                </label>
                <input
                  id="meetup-when"
                  type="datetime-local"
                  step={60}
                  aria-invalid={!!errors.startsAtLocal}
                  className={FIELD}
                  {...register("startsAtLocal")}
                />
                <p className="mt-1 text-xs text-[var(--ui-text-muted)]">
                  Meetups run between 8 AM and 9 PM Central.
                </p>
                {errors.startsAtLocal && <p className={ERROR}>{errors.startsAtLocal.message}</p>}
              </div>

              <div>
                <label htmlFor="meetup-note" className={LABEL}>
                  Note · optional
                </label>
                <textarea
                  id="meetup-note"
                  rows={3}
                  placeholder="e.g. I'll grab a table near the entrance"
                  aria-invalid={!!errors.note}
                  className={`${FIELD} resize-none`}
                  {...register("note")}
                />
                <div className="mt-1 flex justify-between gap-3">
                  {errors.note ? (
                    <p className="text-xs text-red-600">{errors.note.message}</p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`text-xs ${noteLength > MEETUP_NOTE_MAX ? "text-red-600" : "text-[var(--ui-text-subtle)]"}`}
                  >
                    {noteLength}/{MEETUP_NOTE_MAX}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[var(--ui-text-muted)]">
                They can accept or decline. If the time doesn&apos;t work, they decline and
                either of you can propose again.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-[var(--org-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--org-primary)] transition hover:bg-[var(--ui-surface)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={propose.isPending || noSpots || locationsLoading}
                  className="flex-1 rounded-xl bg-[var(--org-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a34800] disabled:opacity-50 cursor-pointer"
                >
                  {propose.isPending ? "Sending..." : "Send request"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
