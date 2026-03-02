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
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white/90 placeholder-white/30 transition-all duration-200 focus:border-white/25 focus:bg-white/8 focus:ring-2 focus:ring-white/15 focus:outline-none hover:border-white/20 resize-none";

const LABEL_CLS = "text-xs font-semibold tracking-widest text-white/45 uppercase";

function BackgroundAndSocialsForm({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: BackgroundAndSocialsData) => void;
  onBack: () => void;
  defaultValues?: Partial<BackgroundAndSocialsData>;
}) {
  const fieldsRef = useStepEntry();
  const { formRef, triggerShake } = useErrorShake();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
          <p className="mb-1 text-xs font-semibold tracking-widest text-white/40 uppercase">
            Step 4 of 6
          </p>
          <h2 className="text-2xl font-bold text-white">Additional details</h2>
          <p className="mt-1.5 text-sm text-white/50">
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
              <span className="ml-1 font-normal normal-case text-white/30">
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
          <div className="h-px flex-1 bg-white/8" />
          <span className="text-xs font-semibold tracking-widest text-white/25 uppercase">
            Socials
          </span>
          <div className="h-px flex-1 bg-white/8" />
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

export default BackgroundAndSocialsForm;
