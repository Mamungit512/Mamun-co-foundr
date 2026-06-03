"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import { useStepEntry, useErrorShake } from "@/hooks/useOnboardingAnimation";

type UTBackgroundAndSocialsData = {
  linkedin?: string;
  git?: string;
};

const LABEL_CLS =
  "text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase";

function UTBackgroundAndSocialsForm({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: UTBackgroundAndSocialsData) => void;
  onBack: () => void;
  defaultValues?: Partial<UTBackgroundAndSocialsData>;
}) {
  const fieldsRef = useStepEntry();
  const { formRef, triggerShake } = useErrorShake();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UTBackgroundAndSocialsData>({ defaultValues });

  const errCount = Object.keys(errors).length;
  useEffect(() => {
    if (errCount > 0) triggerShake();
  }, [errCount, triggerShake]);

  const onSubmit = (data: UTBackgroundAndSocialsData) => onNext(data);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <div ref={fieldsRef} className="flex flex-col gap-y-8">

        {/* ── Header ── */}
        <div className="pb-4">
          <p className="mb-1 text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase">
            Step 4 of 5
          </p>
          <h2 className="text-2xl font-bold text-[var(--ui-text)]">Additional details</h2>
          <p className="mt-1.5 text-sm text-[var(--ui-text-muted)]">
            All fields are optional — add what feels relevant.
          </p>
        </div>

        {/* ── Social links ── */}
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-1.5">
            <label className={LABEL_CLS}>LinkedIn</label>
            <FormInput
              type="text"
              placeholder="linkedin.com/in/your-name"
              {...register("linkedin")}
            />
          </div>

          <div className="flex flex-col gap-y-1.5">
            <label className={LABEL_CLS}>GitHub / GitLab</label>
            <FormInput
              type="text"
              placeholder="github.com/yourusername"
              {...register("git")}
            />
          </div>
        </div>

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

export default UTBackgroundAndSocialsForm;
