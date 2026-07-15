"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";
import { useStepEntry, useErrorShake } from "@/hooks/useOnboardingAnimation";

type UTStartupFormData = {
  hasStartup: "yes" | "no";
  intent: "join_me" | "seeking_to_join" | "no_preference";
  startupName?: string;
  startupDescription?: string;
  startupTimeSpent?: string;
  startupFunding?: string;
  coFounderStatus?: string;
  equityExpectation?: number;
};

const TEXTAREA_CLS =
  "w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3.5 text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] transition-all duration-200 focus:border-[var(--ui-border-strong)] focus:bg-[var(--ui-surface)] focus:ring-2 focus:ring-[var(--ui-border)] focus:outline-none hover:border-[var(--ui-border-strong)] resize-none";

const SELECT_CLS =
  "w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3.5 text-[var(--ui-text)] transition-all duration-200 focus:border-[var(--ui-border-strong)] focus:bg-[var(--ui-surface)] focus:ring-2 focus:ring-[var(--ui-border)] focus:outline-none hover:border-[var(--ui-border-strong)] [&>option]:bg-[var(--ui-popover-bg)] [&>option]:text-[var(--ui-text)]";

const LABEL_CLS = "text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase";

const PILL_RADIO_CLS =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm text-[var(--ui-text)] transition-all duration-150 hover:border-[var(--ui-border-strong)] hover:bg-[var(--ui-surface)] has-[:checked]:border-[var(--ui-text-muted)] has-[:checked]:bg-[var(--ui-surface-active)]";

function UTStartupForm({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: UTStartupFormData) => void;
  onBack: () => void;
  defaultValues?: Partial<UTStartupFormData>;
}) {
  const fieldsRef = useStepEntry();
  const { formRef, triggerShake } = useErrorShake();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UTStartupFormData>({ defaultValues });

  const hasStartup = useWatch({ control, name: "hasStartup" });
  const startupDescriptionValue = watch("startupDescription") || "";

  const errCount = Object.keys(errors).length;
  useEffect(() => {
    if (errCount > 0) triggerShake();
  }, [errCount, triggerShake]);

  const onSubmit = (data: UTStartupFormData) => onNext(data);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <div ref={fieldsRef} className="flex flex-col gap-y-8">

        {/* ── Header ── */}
        <div className="pb-4">
          <p className="mb-1 text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase">
            Step 3 of 6
          </p>
          <h2 className="text-2xl font-bold text-[var(--ui-text)]">Startup or idea</h2>
          <p className="mt-1.5 text-sm text-[var(--ui-text-muted)]">
            Share what you&apos;re building — or what you want to build.
          </p>
        </div>

        {/* ── Has startup? ── */}
        <div className="flex flex-col gap-y-3">
          <label className={LABEL_CLS}>
            Do you already have a startup or idea? *
          </label>
          <div className="flex gap-x-3">
            {(["yes", "no"] as const).map((val) => (
              <label
                key={val}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150 ${
                  hasStartup === val
                    ? "border-[var(--ui-text-muted)] bg-[var(--ui-surface-active)] text-[var(--ui-text)]"
                    : "border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-muted)] hover:border-[var(--ui-border-strong)] hover:text-[var(--ui-text)]"
                }`}
              >
                <input
                  type="radio"
                  value={val}
                  {...register("hasStartup", { required: true })}
                  className="sr-only"
                />
                {val === "yes" ? "Yes, I do" : "Not yet"}
              </label>
            ))}
          </div>
          {errors.hasStartup && (
            <p className="text-xs text-red-400">This field is required</p>
          )}
        </div>

        {/* ── Co-Founder Matching Intent (always shown) ── */}
        <div className="flex flex-col gap-y-3">
          <label className={LABEL_CLS}>Co-Founder Matching Intent *</label>
          <div className="flex flex-col gap-y-2">
            {[
              {
                value: "join_me" as const,
                label: "Join me — I have a startup/idea",
              },
              {
                value: "seeking_to_join" as const,
                label: "Seeking to join — I want to join someone else's project",
              },
              {
                value: "no_preference" as const,
                label: "No preference — open to either",
              },
            ].map(({ value, label }) => (
              <label key={value} className={PILL_RADIO_CLS}>
                <input
                  type="radio"
                  value={value}
                  {...register("intent", {
                    required: "Please select your matching intent",
                  })}
                  className="sr-only"
                />
                <span
                  className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                    watch("intent") === value
                      ? "border-[var(--ui-btn-bg)] bg-[var(--ui-btn-bg)]"
                      : "border-[var(--ui-border-strong)] bg-transparent"
                  }`}
                />
                {label}
              </label>
            ))}
          </div>
          {errors.intent && (
            <p className="text-xs text-red-400">{errors.intent.message}</p>
          )}
        </div>

        {hasStartup === "yes" && (
          <>
            {/* ── Startup basics: Name + Description ── */}
            <div className="flex flex-col gap-y-5">
              <div className="flex flex-col gap-y-1.5">
                <label className={LABEL_CLS}>Company or Project Name</label>
                <FormInput
                  type="text"
                  placeholder="e.g. Cohub, FinTrack"
                  {...register("startupName")}
                />
              </div>

              <div className="flex flex-col gap-y-1.5">
                <label className={LABEL_CLS}>Brief Description</label>
                <textarea
                  rows={3}
                  placeholder="Tell us what it's about in 1–2 sentences"
                  className={TEXTAREA_CLS}
                  {...register("startupDescription")}
                />
                <AIWriter
                  text={startupDescriptionValue}
                  fieldType="startupDescription"
                  onAccept={(s) => setValue("startupDescription", s)}
                />
              </div>
            </div>

            {/* ── Section break: optional details ── */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--ui-surface)]" />
              <span className="text-xs font-semibold tracking-widest text-[var(--ui-text-subtle)] uppercase">
                Details
              </span>
              <div className="h-px flex-1 bg-[var(--ui-surface)]" />
            </div>

            {/* ── Status: Time + Funding (2-col) ── */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <div className="flex flex-col gap-y-1.5">
                <label className={LABEL_CLS}>Time Spent</label>
                <select {...register("startupTimeSpent")} className={SELECT_CLS}>
                  <option value="">Select…</option>
                  <option value="Just started">Just started</option>
                  <option value="1-3 months">1–3 months</option>
                  <option value="3-6 months">3–6 months</option>
                  <option value="6-12 months">6–12 months</option>
                  <option value="1-2 years">1–2 years</option>
                  <option value="2+ years">2+ years</option>
                </select>
              </div>

              <div className="flex flex-col gap-y-1.5">
                <label className={LABEL_CLS}>Funding Status</label>
                <select {...register("startupFunding")} className={SELECT_CLS}>
                  <option value="">Select…</option>
                  <option value="Idea stage">Idea stage</option>
                  <option value="Bootstrapped">Bootstrapped</option>
                  <option value="Friends & Family">Friends & Family</option>
                  <option value="Pre-seed">Pre-seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A+">Series A+</option>
                </select>
              </div>
            </div>

            {/* ── Co-founder status ── */}
            <div className="flex flex-col gap-y-3">
              <label className={LABEL_CLS}>Co-Founder Status *</label>
              <div className="flex flex-col gap-y-2">
                {[
                  "Solo founder",
                  "Have co-founder(s)",
                  "Seeking co-founder",
                ].map((option) => (
                  <label key={option} className={PILL_RADIO_CLS}>
                    <input
                      type="radio"
                      value={option}
                      {...register("coFounderStatus", { required: "Co-founder status is required" })}
                      className="sr-only"
                    />
                    <span
                      className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                        watch("coFounderStatus") === option
                          ? "border-[var(--ui-btn-bg)] bg-[var(--ui-btn-bg)]"
                          : "border-[var(--ui-border-strong)] bg-transparent"
                      }`}
                    />
                    {option}
                  </label>
                ))}
              </div>
              {errors.coFounderStatus && (
                <p className="text-xs text-red-400">{errors.coFounderStatus.message}</p>
              )}
            </div>

            {/* ── Equity Expectation ── */}
            <div className="flex flex-col gap-y-1.5">
              <label className={LABEL_CLS}>Equity Expectation (%) *</label>
              <FormInput
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g. 20"
                {...register("equityExpectation", {
                  required: "Equity expectation is required",
                  min: { value: 0, message: "Equity must be at least 0%" },
                  max: { value: 100, message: "Cannot exceed 100%" },
                })}
              />
              {errors.equityExpectation && (
                <p className="text-xs text-red-400">
                  {errors.equityExpectation.message}
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between gap-4 pt-10 border-t border-[var(--ui-border)]">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--ui-border-strong)] px-5 py-3 text-sm font-medium text-[var(--ui-text-muted)] transition-all duration-200 hover:border-[var(--ui-border-strong)] hover:text-[var(--ui-text)]"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--ui-btn-bg)] px-8 py-3.5 text-sm font-semibold text-[var(--ui-btn-text)] shadow-lg shadow-black/5 transition-all duration-200 hover:bg-[var(--ui-btn-bg)]/90 active:scale-[0.98] sm:flex-none"
          >
            Continue →
          </button>
        </div>

      </div>
    </form>
  );
}

export default UTStartupForm;
