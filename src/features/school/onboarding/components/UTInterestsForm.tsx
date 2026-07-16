"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useStepEntry, useErrorShake } from "@/hooks/useOnboardingAnimation";

const LABEL_CLS =
  "text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase";

const MAX_SELECTIONS = 5;

const INTEREST_DOMAINS = [
  {
    domain: "Deep tech & science",
    tags: [
      "AI / ML",
      "Space Tech",
      "Robotics",
      "Quantum Computing",
      "BioTech",
      "Synthetic Biology",
      "Semiconductors",
      "Defense Tech",
    ],
  },
  {
    domain: "Planet & sustainability",
    tags: [
      "CleanTech",
      "Climate Tech",
      "AgriTech",
      "FoodTech",
      "Water Tech",
      "Circular Economy",
      "Energy Tech",
      "Ocean Tech",
    ],
  },
  {
    domain: "Business & finance",
    tags: [
      "B2B SaaS",
      "Fintech",
      "InsurTech",
      "Web3 / Crypto",
      "Developer Tools",
      "Cybersecurity",
      "Data & Analytics",
      "No-code / Low-code",
    ],
  },
  {
    domain: "Health & life sciences",
    tags: [
      "HealthTech",
      "Mental Health",
      "MedTech",
      "Genomics",
      "FemTech",
      "Drug Discovery",
      "Wellness / Fitness",
      "Digital Health",
    ],
  },
  {
    domain: "People & society",
    tags: [
      "EdTech",
      "Future of Work",
      "GovTech",
      "LegalTech",
      "Social Impact",
      "Diversity & Inclusion",
      "Non-profit / NGO",
      "Immigration Tech",
    ],
  },
  {
    domain: "Consumer & media",
    tags: [
      "Consumer",
      "Creator Economy",
      "Media & Entertainment",
      "Gaming / XR",
      "Fashion / Retail Tech",
      "Travel Tech",
      "Sports Tech",
      "Music Tech",
    ],
  },
  {
    domain: "Infrastructure & industry",
    tags: [
      "PropTech",
      "Construction Tech",
      "Logistics & Supply Chain",
      "Mobility / Transport",
      "Manufacturing",
      "Aerospace",
      "Mining Tech",
      "Oil & Gas Tech",
    ],
  },
  {
    domain: "Emerging & frontier",
    tags: [
      "Longevity Tech",
      "Neurotech",
      "Nanotechnology",
      "Human Augmentation",
      "Metaverse",
      "Smart Cities",
      "Halal Tech",
      "Islamic Fintech",
    ],
  },
] as const;

type UTInterestsData = {
  priorityAreas?: string[];
};

function UTInterestsForm({
  onBack,
  onNext,
  onManualSave,
  defaultValues,
}: {
  onBack: () => void;
  onNext: (data: UTInterestsData) => void;
  onManualSave?: (data: Partial<UTInterestsData>) => void;
  defaultValues?: Partial<UTInterestsData>;
}) {
  const fieldsRef = useStepEntry();
  const { formRef, triggerShake } = useErrorShake();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm<UTInterestsData>({ defaultValues });

  const selectedAreas = watch("priorityAreas") || [];

  // defaultValues crosses a JSON boundary (localStorage draft / API response),
  // so its shape isn't guaranteed to match the string[] type at runtime.
  const defaultPriorityAreas = Array.isArray(defaultValues?.priorityAreas)
    ? defaultValues.priorityAreas
    : [];

  useEffect(() => {
    if (defaultPriorityAreas.length > 0) {
      reset({ priorityAreas: defaultPriorityAreas });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, reset]);

  const errCount = Object.keys(errors).length;
  useEffect(() => {
    if (errCount > 0) triggerShake();
  }, [errCount, triggerShake]);

  const onSubmit = (data: UTInterestsData) => {
    onNext(data);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <div ref={fieldsRef} className="flex flex-col gap-y-8">

        {/* ── Header ── */}
        <div className="pb-4">
          <p className="mb-1 text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase">
            Step 5 of 6
          </p>
          <h2 className="text-2xl font-bold text-[var(--ui-text)]">
            Interest library
          </h2>
          <p className="mt-1.5 text-sm text-[var(--ui-text-muted)]">
            Select up to 5 areas you want to work on.
          </p>
        </div>

        {/* ── Interest Library ── */}
        <div className="flex flex-col gap-y-6">
          <div className="flex items-center justify-between">
            <label className={LABEL_CLS}>Your interests</label>
            <span className="text-xs font-semibold text-[var(--ui-text-muted)]">
              {selectedAreas.length} / {MAX_SELECTIONS}
            </span>
          </div>

          {INTEREST_DOMAINS.map((section) => (
            <div key={section.domain} className="flex flex-col gap-y-2">
              <p className="text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase">
                {section.domain}
              </p>
              <div className="flex flex-wrap gap-2">
                {section.tags.map((tag) => {
                  const checked = selectedAreas.includes(tag);
                  const isDisabled =
                    selectedAreas.length >= MAX_SELECTIONS && !checked;
                  return (
                    <label
                      key={tag}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all duration-150 ${
                        isDisabled
                          ? "cursor-not-allowed border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-subtle)] opacity-50"
                          : checked
                            ? "border-[var(--ui-text-muted)] bg-[var(--ui-surface-active)] text-[var(--ui-text)]"
                            : "border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-muted)] hover:border-[var(--ui-border-strong)] hover:text-[var(--ui-text)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={tag}
                        {...register("priorityAreas")}
                        disabled={isDisabled}
                        defaultChecked={defaultPriorityAreas.includes(tag)}
                        className="sr-only"
                      />
                      {tag}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
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
            Review →
          </button>
        </div>

      </div>
    </form>
  );
}

export default UTInterestsForm;
