"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";
import { useStepEntry, useErrorShake } from "@/hooks/useOnboardingAnimation";

type StartupFormData = {
  hasStartup: "yes" | "no";
  startupName?: string;
  startupDescription?: string;
  startupTimeSpent?: string;
  startupFunding?: string;
  coFounderStatus?: string;
  fullTimeTimeline?: string;
  responsibilities?: string[];
  equityExpectation?: number;
};

const RESPONSIBILITY_OPTIONS = [
  "Ops",
  "Sales",
  "Design",
  "Engineering",
  "Product",
];

const TEXTAREA_CLS =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white/90 placeholder-white/30 transition-all duration-200 focus:border-white/25 focus:bg-white/8 focus:ring-2 focus:ring-white/15 focus:outline-none hover:border-white/20 resize-none";

const SELECT_CLS =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white/90 transition-all duration-200 focus:border-white/25 focus:bg-white/8 focus:ring-2 focus:ring-white/15 focus:outline-none hover:border-white/20 [&>option]:bg-neutral-900";

const LABEL_CLS = "text-xs font-semibold tracking-widest text-white/45 uppercase";

const PILL_RADIO_CLS =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all duration-150 hover:border-white/20 hover:bg-white/8 has-[:checked]:border-white/40 has-[:checked]:bg-white/15";

function StartupForm({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: StartupFormData) => void;
  onBack: () => void;
  defaultValues?: Partial<StartupFormData>;
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
  } = useForm<StartupFormData>({ defaultValues });

  const hasStartup = useWatch({ control, name: "hasStartup" });
  const startupDescriptionValue = watch("startupDescription") || "";

  const errCount = Object.keys(errors).length;
  useEffect(() => {
    if (errCount > 0) triggerShake();
  }, [errCount, triggerShake]);

  const onSubmit = (data: StartupFormData) => onNext(data);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <div ref={fieldsRef} className="flex flex-col gap-y-8">

        {/* ── Header ── */}
        <div className="pb-4">
          <p className="mb-1 text-xs font-semibold tracking-widest text-white/40 uppercase">
            Step 3 of 6
          </p>
          <h2 className="text-2xl font-bold text-white">Startup or idea</h2>
          <p className="mt-1.5 text-sm text-white/50">
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
                    ? "border-white/40 bg-white/15 text-white"
                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
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
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-xs font-semibold tracking-widest text-white/25 uppercase">
                Optional details
              </span>
              <div className="h-px flex-1 bg-white/8" />
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
                  <option value="Bootstrapped">Bootstrapped</option>
                  <option value="Pre-seed">Pre-seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A+">Series A+</option>
                  <option value="Grant funded">Grant funded</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* ── Co-founder status ── */}
            <div className="flex flex-col gap-y-3">
              <label className={LABEL_CLS}>Co-Founder Status</label>
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
                      {...register("coFounderStatus")}
                      className="sr-only"
                    />
                    <span
                      className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                        watch("coFounderStatus") === option
                          ? "border-white bg-white"
                          : "border-white/30 bg-transparent"
                      }`}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* ── Deal terms: Timeline + Equity (2-col) ── */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <div className="flex flex-col gap-y-1.5">
                <label className={LABEL_CLS}>Full-Time Timeline</label>
                <select
                  {...register("fullTimeTimeline")}
                  className={SELECT_CLS}
                >
                  <option value="">Select…</option>
                  <option value="Already full-time">Already full-time</option>
                  <option value="Within 1 month">Within 1 month</option>
                  <option value="Within 3 months">Within 3 months</option>
                  <option value="Within 6 months">Within 6 months</option>
                  <option value="Within 1 year">Within 1 year</option>
                  <option value="Unsure">Unsure</option>
                </select>
              </div>

              <div className="flex flex-col gap-y-1.5">
                <label className={LABEL_CLS}>Equity Expectation (%)</label>
                <FormInput
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g. 20"
                  {...register("equityExpectation", {
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
            </div>

            {/* ── Responsibility Areas ── */}
            <div className="flex flex-col gap-y-3">
              <label className={LABEL_CLS}>Responsibility Areas</label>
              <div className="flex flex-wrap gap-2">
                {RESPONSIBILITY_OPTIONS.map((area) => {
                  const checked = (watch("responsibilities") || []).includes(
                    area,
                  );
                  return (
                    <label
                      key={area}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all duration-150 ${
                        checked
                          ? "border-white/40 bg-white/15 text-white"
                          : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={area}
                        {...register("responsibilities")}
                        className="sr-only"
                      />
                      {area}
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between gap-4 pt-10 border-t border-white/8">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/60 transition-all duration-200 hover:border-white/30 hover:text-white"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black shadow-lg shadow-white/10 transition-all duration-200 hover:bg-white/90 active:scale-[0.98] sm:flex-none"
          >
            Continue →
          </button>
        </div>

      </div>
    </form>
  );
}

export default StartupForm;
