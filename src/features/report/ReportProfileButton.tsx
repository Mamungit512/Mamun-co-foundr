"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { FaFlag } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

interface ReportFormData {
  reason: string;
  details: string;
}

const REPORT_REASONS = [
  "Fake or scam profile",
  "Harassment or abusive behavior",
  "Inappropriate or offensive content",
  "Spam or solicitation",
  "Impersonation",
  "Other",
];

interface ReportProfileButtonProps {
  reportedUserId: string;
  reportedName?: string;
}

export default function ReportProfileButton({
  reportedUserId,
  reportedName,
}: ReportProfileButtonProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormData>({ defaultValues: { reason: "", details: "" } });

  const selectedReason = watch("reason");

  const close = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = async (data: ReportFormData) => {
    try {
      const res = await fetch("/api/report-abuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedUserId, reportedName, ...data }),
      });
      if (!res.ok) throw new Error();
      toast.success("Report submitted. Thank you.");
      close();
    } catch {
      toast.error("Couldn't submit report. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex-shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-red-500 cursor-pointer"
        title="Report this profile"
      >
        <FaFlag className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative mx-4 w-full max-w-md rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-popover-bg)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={close}
                className="absolute top-4 right-4 rounded-full p-2 text-gray-400 transition hover:bg-[var(--ui-surface-active)] hover:text-[var(--ui-text)] cursor-pointer"
              >
                <FaTimes className="h-4 w-4" />
              </button>

              <h2 className="mb-1 text-lg font-bold text-[var(--ui-text)]">
                Report Profile
              </h2>
              {reportedName && (
                <p className="mb-5 text-sm text-[var(--ui-text-muted)]">
                  Reporting {reportedName}
                </p>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[var(--ui-text)]">
                    Why are you reporting this profile?{" "}
                    <span className="text-red-500">*</span>
                  </p>
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                        selectedReason === reason
                          ? "border-[var(--ui-border-strong)] bg-[var(--ui-surface-active)]"
                          : "border-[var(--ui-border)] bg-[var(--ui-surface)]"
                      }`}
                    >
                      <input
                        type="radio"
                        value={reason}
                        {...register("reason", { required: "Please select a reason" })}
                        className="sr-only"
                      />
                      <span
                        className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                          selectedReason === reason
                            ? "border-[var(--ui-text)] bg-[var(--ui-text)]"
                            : "border-[var(--ui-border-strong)] bg-transparent"
                        }`}
                      />
                      <span className="text-sm text-[var(--ui-text)]">{reason}</span>
                    </label>
                  ))}
                  {errors.reason && (
                    <p className="text-xs text-red-400">{errors.reason.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[var(--ui-text)]">
                    Additional details{" "}
                    <span className="font-normal text-[var(--ui-text-muted)]">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add any details that might help us review this report…"
                    className="w-full resize-none rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] transition-all focus:border-[var(--ui-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-border)] hover:border-[var(--ui-border-strong)]"
                    {...register("details")}
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={close}
                    className="flex-1 rounded-xl border border-[var(--ui-border-strong)] px-4 py-2.5 text-sm font-medium text-[var(--ui-text)] transition hover:bg-[var(--ui-surface)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Submitting…" : "Submit report"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
