"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";
import { useStepEntry, useErrorShake } from "@/hooks/useOnboardingAnimation";

const TEXTAREA_CLS =
  "w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3.5 text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] transition-all duration-200 focus:border-[var(--ui-border-strong)] focus:bg-[var(--ui-surface)] focus:ring-2 focus:ring-[var(--ui-border)] focus:outline-none hover:border-[var(--ui-border-strong)] resize-none";

const LABEL_CLS = "text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase";

function InterestsAndValuesForm({
  onBack,
  onNext,
  onManualSave,
  defaultValues,
}: {
  onBack: () => void;
  onNext: (data: InterestsAndValuesFormData) => void;
  onManualSave?: (data: Partial<InterestsAndValuesFormData>) => void;
  defaultValues?: Partial<InterestsAndValuesFormData>;
}) {
  const fieldsRef = useStepEntry();
  const { formRef, triggerShake } = useErrorShake();

  const priorityOptions = useMemo(
    () => [
      "Emerging Tech",
      "AI",
      "Healthcare",
      "Fintech",
      "Circular Economy",
      "Climate",
      "Education",
      "Consumer",
    ],
    [],
  );

  const [showOtherInput, setShowOtherInput] = React.useState(false);
  const [otherPriority, setOtherPriority] = React.useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<InterestsAndValuesFormData>({ defaultValues });

  const interestsValue = watch("interests") || "";
  const hobbiesValue = watch("hobbies") || "";
  const selectedAreas = watch("priorityAreas") || [];

  useEffect(() => {
    if (defaultValues?.priorityAreas) {
      const others = defaultValues.priorityAreas.filter(
        (area) => !priorityOptions.includes(area),
      );
      if (others.length > 0) {
        setShowOtherInput(true);
        setOtherPriority(others[0]);
      } else {
        setShowOtherInput(false);
        setOtherPriority("");
      }
      reset(defaultValues);
    }
  }, [defaultValues, reset, priorityOptions]);

  const errCount = Object.keys(errors).length;
  useEffect(() => {
    if (errCount > 0) triggerShake();
  }, [errCount, triggerShake]);

  const withOtherPriority = (
    data: InterestsAndValuesFormData,
  ): InterestsAndValuesFormData => ({
    ...data,
    priorityAreas: [
      ...(data.priorityAreas || []),
      ...(showOtherInput && otherPriority ? [otherPriority] : []),
    ],
  });

  const onSubmit = (data: InterestsAndValuesFormData) => {
    onNext(withOtherPriority(data));
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
            Interests &amp; values
          </h2>
          <p className="mt-1.5 text-sm text-[var(--ui-text-muted)]">
            What drives you and what you want to work on.
          </p>
        </div>

        {/* ── Topics of interest ── */}
        <div className="flex flex-col gap-y-1.5">
          <label className={LABEL_CLS}>Topics or Industries</label>
          <FormInput
            type="text"
            placeholder="e.g. AI in mental health, fintech for creators"
            {...register("interests")}
          />
          <AIWriter
            text={interestsValue}
            fieldType="interests"
            onAccept={(s) => setValue("interests", s)}
          />
        </div>

        {/* ── Priority Areas ── */}
        <div className="flex flex-col gap-y-3">
          <div>
            <label className={LABEL_CLS}>MAMUN Priority Areas</label>
            <p className="mt-1 text-xs text-[var(--ui-text-subtle)]">
              Select any that apply to your work.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((area) => {
              const checked = selectedAreas.includes(area);
              return (
                <label
                  key={area}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all duration-150 ${
                    checked
                      ? "border-[var(--ui-text-muted)] bg-[var(--ui-surface-active)] text-[var(--ui-text)]"
                      : "border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-muted)] hover:border-[var(--ui-border-strong)] hover:text-[var(--ui-text)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={area}
                    {...register("priorityAreas")}
                    defaultChecked={defaultValues?.priorityAreas?.includes(area)}
                    className="sr-only"
                  />
                  {area}
                </label>
              );
            })}

            <label
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all duration-150 ${
                showOtherInput
                  ? "border-[var(--ui-text-muted)] bg-[var(--ui-surface-active)] text-[var(--ui-text)]"
                  : "border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-muted)] hover:border-[var(--ui-border-strong)] hover:text-[var(--ui-text)]"
              }`}
            >
              <input
                type="checkbox"
                checked={showOtherInput}
                onChange={(e) => setShowOtherInput(e.target.checked)}
                className="sr-only"
              />
              Other
            </label>
          </div>

          {showOtherInput && (
            <input
              type="text"
              placeholder="Please specify"
              className="w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3.5 text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] transition-all duration-200 focus:border-[var(--ui-border-strong)] focus:bg-[var(--ui-surface)] focus:ring-2 focus:ring-[var(--ui-border)] focus:outline-none hover:border-[var(--ui-border-strong)]"
              value={otherPriority}
              onChange={(e) => setOtherPriority(e.target.value)}
            />
          )}
        </div>

        {/* ── Hobbies ── */}
        <div className="flex flex-col gap-y-1.5">
          <label className={LABEL_CLS}>Hobbies &amp; Interests</label>
          <textarea
            rows={3}
            placeholder="e.g. Rock climbing, journaling, strategy games"
            className={TEXTAREA_CLS}
            {...register("hobbies")}
          />
          <AIWriter
            text={hobbiesValue}
            fieldType="hobbies"
            onAccept={(s) => setValue("hobbies", s)}
          />
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
              onClick={() => onManualSave(withOtherPriority(getValues()))}
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

export default InterestsAndValuesForm;
