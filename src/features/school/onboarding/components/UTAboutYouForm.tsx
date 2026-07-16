"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import LocationSelector from "@/components/ui/LocationSelector";
import { useStepEntry, useErrorShake } from "@/hooks/useOnboardingAnimation";
import UTSchoolFields from "@/features/school/onboarding/components/UTSchoolFields";

type UTAboutYouData = {
  firstName: string;
  lastName: string;
  title: string;
  city: string;
  country: string;
  state?: string;
  utStatus: "student" | "alumni";
  gradYear?: number;
  utCollege?: UTCollege;
  utDegreeType?: UTDegreeType;
  utMajor?: string;
  utSectorInterests?: UTSectorInterest[];
  additionalEducation?: string;
  experience: string;
  personalIntro: string;
  archetype: FounderArchetype;
  isTechnical: "yes" | "no";
};

const CHAR_LIMIT = 500;

const TEXTAREA_CLS =
  "w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3.5 text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] transition-all duration-200 focus:border-[var(--ui-border-strong)] focus:bg-[var(--ui-surface)] focus:ring-2 focus:ring-[var(--ui-border)] focus:outline-none hover:border-[var(--ui-border-strong)] resize-none";

const LABEL_CLS =
  "text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase";

const PILL_RADIO_CLS =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm text-[var(--ui-text)] transition-all duration-150 hover:border-[var(--ui-border-strong)] hover:bg-[var(--ui-surface)] has-[:checked]:border-[var(--ui-text-muted)] has-[:checked]:bg-[var(--ui-surface-active)] has-[:checked]:text-[var(--ui-text)]";

function CharCount({ value, max }: { value: string; max: number }) {
  const remaining = max - value.length;
  return (
    <p
      className={`text-right text-xs ${
        remaining < 50 ? "text-amber-700" : "text-[var(--ui-text-subtle)]"
      }`}
    >
      {value.length} / {max}
    </p>
  );
}

function UTAboutYouForm({
  onNext,
  onBack,
  onManualSave,
  defaultValues,
}: {
  onNext: (data: UTAboutYouData) => void;
  onBack: () => void;
  onManualSave?: (data: Partial<UTAboutYouData>) => void;
  defaultValues?: Partial<UTAboutYouData>;
}) {
  const fieldsRef = useStepEntry();
  const { formRef, triggerShake } = useErrorShake();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<UTAboutYouData>({ defaultValues });

  const experienceValue = watch("experience") || "";
  const personalIntroValue = watch("personalIntro") || "";
  const archetypeValue = watch("archetype");
  const isTechnicalValue = watch("isTechnical");

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const errCount = Object.keys(errors).length;
  useEffect(() => {
    if (errCount > 0) triggerShake();
  }, [errCount, triggerShake]);

  const onSubmit = (data: UTAboutYouData) => onNext(data);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <div ref={fieldsRef} className="flex flex-col gap-y-8">

        {/* ── Header ── */}
        <div className="pb-4">
          <p className="mb-1 text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase">
            Step 2 of 6
          </p>
          <h2 className="text-2xl font-bold text-[var(--ui-text)]">About you</h2>
          <p className="mt-1.5 text-sm text-[var(--ui-text-muted)]">
            Help potential co-founders understand who you are.
          </p>
        </div>

        {/* ── Identity: Name + Title ── */}
        <div className="flex flex-col gap-y-5">
          <div className="flex gap-x-4">
            <div className="flex w-full flex-col gap-y-1.5">
              <label className={LABEL_CLS}>First Name *</label>
              <FormInput
                type="text"
                placeholder="e.g. Teslim"
                {...register("firstName", { required: true })}
              />
              {errors.firstName && (
                <p className="text-xs text-red-400">First name is required</p>
              )}
            </div>
            <div className="flex w-full flex-col gap-y-1.5">
              <label className={LABEL_CLS}>Last Name *</label>
              <FormInput
                type="text"
                placeholder="e.g. Deen"
                {...register("lastName", { required: true })}
              />
              {errors.lastName && (
                <p className="text-xs text-red-400">Last name is required</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-y-1.5">
            <label className={LABEL_CLS}>Job Title *</label>
            <FormInput
              type="text"
              placeholder="e.g. UX Designer, Software Engineer"
              {...register("title", { required: true })}
            />
            {errors.title && (
              <p className="text-xs text-red-400">Job title is required</p>
            )}
          </div>
        </div>

        {/* ── Location ── */}
        <div className="flex flex-col gap-y-1.5">
          <input type="hidden" {...register("country", { required: true })} />
          <input type="hidden" {...register("city", { required: true })} />
          <input type="hidden" {...register("state")} />
          <LocationSelector
            countryValue={watch("country") || ""}
            stateValue={watch("state") || ""}
            cityValue={watch("city") || ""}
            onCountryChange={(v) => setValue("country", v, { shouldValidate: true })}
            onStateChange={(v) => setValue("state", v, { shouldValidate: true })}
            onCityChange={(v) => setValue("city", v, { shouldValidate: true })}
            errors={{
              country: errors.country ? "Country is required" : undefined,
              state: errors.state ? "State is required" : undefined,
              city: errors.city ? "City is required" : undefined,
            }}
          />
        </div>

        {/* ── School Details (UT-specific) ── */}
        <UTSchoolFields
          register={register}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />

        {/* ── Work Experience ── */}
        <div className="flex flex-col gap-y-1.5">
          <label className={LABEL_CLS}>Work Experience *</label>
          <textarea
            {...register("experience", {
              required: "Work experience is required",
              maxLength: { value: CHAR_LIMIT, message: `Maximum ${CHAR_LIMIT} characters` },
            })}
            className={TEXTAREA_CLS}
            rows={3}
            maxLength={CHAR_LIMIT}
            placeholder="Current/previous job title(s) or internships"
          />
          <CharCount value={experienceValue} max={CHAR_LIMIT} />
          {errors.experience && (
            <p className="text-xs text-red-400">{errors.experience.message}</p>
          )}
        </div>

        {/* ── Personal Intro ── */}
        <div className="flex flex-col gap-y-1.5">
          <label className={LABEL_CLS}>Personal Introduction *</label>
          <textarea
            {...register("personalIntro", {
              required: "Your introduction cannot be empty.",
              minLength: { value: 10, message: "Must be at least 10 characters." },
              maxLength: { value: CHAR_LIMIT, message: `Maximum ${CHAR_LIMIT} characters` },
            })}
            className={TEXTAREA_CLS}
            rows={4}
            maxLength={CHAR_LIMIT}
            placeholder="Write a short paragraph introducing yourself…"
          />
          <CharCount value={personalIntroValue} max={CHAR_LIMIT} />
          {errors.personalIntro && (
            <p className="text-xs text-red-400">{errors.personalIntro.message}</p>
          )}
        </div>

        {/* ── Founder Archetype ── */}
        <div className="flex flex-col gap-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <label className={LABEL_CLS}>Founder Archetype *</label>
              <p className="mt-1 text-xs leading-relaxed text-[var(--ui-text-muted)]">
                Which best describes your founding style?
              </p>
            </div>
            <a
              href="/founder-archetypes"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 mt-0.5 text-xs text-[var(--ui-text-subtle)] underline-offset-2 transition-colors duration-150 hover:text-[var(--ui-text-muted)] hover:underline"
            >
              Learn more ↗
            </a>
          </div>
          <div className="flex flex-col gap-y-2">
            {(
              [
                {
                  value: "the_scaler",
                  label: "The Scaler",
                  tooltip:
                    "Speed and scale above all else. Uses AI and proprietary data to grow without headcount. Measures success by 10–15% week-over-week revenue or user growth.",
                },
                {
                  value: "the_steward",
                  label: "The Steward",
                  tooltip:
                    "Values-driven and mission-first. Prioritizes ethical integrity and community trust in every decision. Measures success by social impact and adherence to moral guardrails.",
                },
                {
                  value: "the_architect",
                  label: "The Architect",
                  tooltip:
                    "Builds the infrastructure others run on. Creates platforms powered by network effects. Measures success by total value generated across the ecosystem — not just by the company itself.",
                },
              ] as const
            ).map(({ value, label, tooltip }) => (
              <label key={value} className={`${PILL_RADIO_CLS} relative`}>
                <input
                  type="radio"
                  value={value}
                  {...register("archetype", { required: "Please select an archetype" })}
                  className="sr-only"
                />
                <span
                  className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all duration-150 ${
                    archetypeValue === value
                      ? "border-[var(--ui-btn-bg)] bg-[var(--ui-btn-bg)]"
                      : "border-[var(--ui-border-strong)] bg-transparent"
                  }`}
                />
                <span className="flex-1">{label}</span>
                <span
                  className="group/tip relative ml-auto flex items-center"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="flex h-5 w-5 cursor-default items-center justify-center rounded-full border border-[var(--ui-border-strong)] text-[10px] font-medium text-[var(--ui-text-subtle)] transition-colors duration-150 group-hover/tip:border-white/35 group-hover/tip:text-[var(--ui-text-muted)]">
                    i
                  </span>
                  <span className="pointer-events-none absolute right-0 bottom-7 z-50 w-60 rounded-xl border border-[var(--ui-border)] bg-neutral-900 px-3.5 py-3 text-left text-xs leading-relaxed text-[var(--ui-text-muted)] opacity-0 shadow-2xl transition-opacity duration-150 group-hover/tip:opacity-100">
                    {tooltip}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {errors.archetype && (
            <p className="text-xs text-red-400">{errors.archetype.message}</p>
          )}
        </div>

        {/* ── Technical Background ── */}
        <div className="flex flex-col gap-y-3">
          <label className={LABEL_CLS}>Technical Background? *</label>
          <div className="flex gap-x-3">
            {(["yes", "no"] as const).map((val) => (
              <label
                key={val}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150 ${
                  isTechnicalValue === val
                    ? "border-[var(--ui-text-muted)] bg-[var(--ui-surface-active)] text-[var(--ui-text)]"
                    : "border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-muted)] hover:border-[var(--ui-border-strong)] hover:text-[var(--ui-text)]"
                }`}
              >
                <input
                  type="radio"
                  value={val}
                  {...register("isTechnical", { required: true })}
                  className="sr-only"
                />
                {val === "yes" ? "Yes" : "No"}
              </label>
            ))}
          </div>
          {errors.isTechnical && (
            <p className="text-xs text-red-400">Please select an option</p>
          )}
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

export default UTAboutYouForm;
