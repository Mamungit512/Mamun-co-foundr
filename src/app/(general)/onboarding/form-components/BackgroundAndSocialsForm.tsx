"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";
import { useStepEntry, useErrorShake } from "@/hooks/useOnboardingAnimation";

type BackgroundAndSocialsData = {
  gender?: string;
  birthdate?: string;
  accomplishments?: string;
  schedulingUrl?: string;
  linkedin?: string;
  twitter?: string;
  git?: string;
  personalWebsite?: string;
};

const TEXTAREA_CLS =
  "w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3.5 text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] transition-all duration-200 focus:border-[var(--ui-border-strong)] focus:bg-[var(--ui-surface)] focus:ring-2 focus:ring-[var(--ui-border)] focus:outline-none hover:border-[var(--ui-border-strong)] resize-none";

const LABEL_CLS = "text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase";

function BackgroundAndSocialsForm({
  onNext,
  onBack,
  onManualSave,
  defaultValues,
}: {
  onNext: (data: BackgroundAndSocialsData) => void;
  onBack: () => void;
  onManualSave?: (data: Partial<BackgroundAndSocialsData>) => void;
  defaultValues?: Partial<BackgroundAndSocialsData>;
}) {
  const fieldsRef = useStepEntry();
  const { formRef, triggerShake } = useErrorShake();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BackgroundAndSocialsData>({ defaultValues });

  const accomplishmentsValue = watch("accomplishments") || "";

  const errCount = Object.keys(errors).length;
  useEffect(() => {
    if (errCount > 0) triggerShake();
  }, [errCount, triggerShake]);

  const onSubmit = (data: BackgroundAndSocialsData) => onNext(data);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <div ref={fieldsRef} className="flex flex-col gap-y-8">

        {/* ── Header ── */}
        <div className="pb-4">
          <p className="mb-1 text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase">
            Step 4 of 6
          </p>
          <h2 className="text-2xl font-bold text-[var(--ui-text)]">Additional details</h2>
          <p className="mt-1.5 text-sm text-[var(--ui-text-muted)]">
            All fields are optional — add what feels relevant.
          </p>
        </div>

        {/* ── Background: Demographics ── */}
        <div className="flex flex-col gap-y-5">
          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex flex-col gap-y-1.5">
              <label className={LABEL_CLS}>Gender</label>
              <FormInput
                type="text"
                placeholder="e.g. Female, Male, Non-binary"
                {...register("gender")}
              />
            </div>
            <div className="flex flex-col gap-y-1.5">
              <label className={LABEL_CLS}>Birthdate</label>
              <FormInput
                type="text"
                placeholder="MM/DD/YYYY"
                {...register("birthdate")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-y-1.5">
            <label className={LABEL_CLS}>Impressive Accomplishments</label>
            <textarea
              {...register("accomplishments")}
              className={TEXTAREA_CLS}
              rows={4}
              placeholder={`Built an app used by 10k+ users\nLaunched a startup\nTop 5% LeetCode`}
            />
            <AIWriter
              text={accomplishmentsValue}
              fieldType="accomplishments"
              onAccept={(s) => setValue("accomplishments", s)}
            />
          </div>

          <div className="flex flex-col gap-y-1.5">
            <label className={LABEL_CLS}>
              Scheduling Link
              <span className="ml-1 font-normal normal-case text-[var(--ui-text-subtle)]">
                (Calendly, Cal.com…)
              </span>
            </label>
            <FormInput
              {...register("schedulingUrl")}
              type="url"
              placeholder="https://calendly.com/your-link"
            />
          </div>
        </div>

        {/* ── Section break ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--ui-surface)]" />
          <span className="text-xs font-semibold tracking-widest text-[var(--ui-text-subtle)] uppercase">
            Socials
          </span>
          <div className="h-px flex-1 bg-[var(--ui-surface)]" />
        </div>

        {/* ── Social links: 2×2 grid ── */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <div className="flex flex-col gap-y-1.5">
            <label className={LABEL_CLS}>LinkedIn</label>
            <FormInput
              type="text"
              placeholder="linkedin.com/in/your-name"
              {...register("linkedin")}
            />
          </div>

          <div className="flex flex-col gap-y-1.5">
            <label className={LABEL_CLS}>Twitter / X</label>
            <FormInput
              type="text"
              placeholder="twitter.com/yourhandle"
              {...register("twitter")}
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

          <div className="flex flex-col gap-y-1.5">
            <label className={LABEL_CLS}>Personal Website</label>
            <FormInput
              type="text"
              placeholder="yourportfolio.com"
              {...register("personalWebsite")}
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
          {onManualSave && (
            <button
              type="button"
              onClick={() => onManualSave(getValues())}
              className="cursor-pointer text-sm font-medium text-[var(--ui-text-muted)] underline-offset-2 hover:text-[var(--ui-text)] hover:underline"
            >
              Save progress
            </button>
          )}
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

export default BackgroundAndSocialsForm;
