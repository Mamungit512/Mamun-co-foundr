"use client";

import AboutYouForm from "@/app/(general)/onboarding/form-components/AboutYouForm";
import BackgroundAndSocialsForm from "@/app/(general)/onboarding/form-components/BackgroundAndSocialsForm";
import InterestsAndValuesForm from "@/app/(general)/onboarding/form-components/InterestsAndValuesForm";
import ProfilePhotoForm from "@/app/(general)/onboarding/form-components/ProfilePhotoForm";
import ReviewForm from "@/app/(general)/onboarding/form-components/ReviewForm";
import StartupForm from "@/app/(general)/onboarding/form-components/StartupForm";
import OnboardingProgressBar from "@/components/ui/OnboardingProgressBar";
import { useOnboardingDraft } from "@/hooks/useOnboardingDraft";
import { useStepTransition } from "@/hooks/useOnboardingAnimation";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

type CreateProfileProps = {
  onSubmit: (
    formData: OnboardingData,
  ) => Promise<{ success: boolean; error?: string }>;
  initialData?: OnboardingData;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

/*
 * 1. Photo
 * 2. About You (name, title, location, education, experience, intro, archetype, mindset, isTechnical)
 * 3. Startup (essentials + conditional detailed fields on one page)
 * 4. Additional Details (optional background + socials)
 * 5. Interests & Values
 * 6. Review
 */
const TOTAL_STEPS = 6;

/**
 * Returns which steps show a checkmark.
 * - Steps 1–3 have required fields: complete only when those fields are filled.
 * - Steps 4–5 are optional: complete once the user has visited them.
 */
function getCompletedSteps(
  data: OnboardingData,
  visited: Set<number>,
): Set<number> {
  const completed = new Set<number>();

  if (data.pfp_url) completed.add(1);

  if (
    data.firstName &&
    data.lastName &&
    data.title &&
    data.country &&
    data.city &&
    data.education &&
    data.experience &&
    data.personalIntro &&
    data.archetype &&
    data.satisfaction &&
    data.batteryLevel &&
    data.isTechnical
  )
    completed.add(2);

  if (data.hasStartup) completed.add(3);

  if (visited.has(4)) completed.add(4);
  if (visited.has(5)) completed.add(5);

  return completed;
}

function hasExistingProfileData(profile: OnboardingData): boolean {
  return !!(
    profile.firstName ||
    profile.lastName ||
    profile.personalIntro ||
    profile.pfp_url
  );
}

function CreateProfile({ onSubmit, initialData, onSuccess, onError }: CreateProfileProps) {
  const draft = useOnboardingDraft();
  const { containerRef, transition } = useStepTransition();

  const [stepNumber, setStepNumber] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set());
  const [preFilledNotice, setPreFilledNotice] = useState(false);

  useEffect(() => {
    const savedDraft = draft.load();
    if (savedDraft) {
      setStepNumber(savedDraft.step);
      setFormData(savedDraft.data);
      const visited = new Set<number>();
      for (let i = 1; i < savedDraft.step; i++) visited.add(i);
      setVisitedSteps(visited);
    } else if (initialData && hasExistingProfileData(initialData)) {
      setFormData(initialData);
      setPreFilledNotice(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToStep = (
    newStep: number,
    dir: "forward" | "back",
    newData: Partial<OnboardingData> = {},
  ) => {
    const merged = { ...formData, ...newData };

    transition(dir, () => {
      setFormData(merged);
      setStepNumber(newStep);
      draft.save(newStep, merged);
    });
  };

  const advanceStep = (newData: Partial<OnboardingData>, nextStep: number) => {
    setVisitedSteps((prev) => {
      const next = new Set(prev);
      next.add(stepNumber);
      return next;
    });
    goToStep(nextStep, "forward", newData);
  };

  const handleBack = () => {
    goToStep(stepNumber - 1, "back");
  };

  const handleManualSave = (stepData: Partial<OnboardingData>) => {
    const merged = { ...formData, ...stepData };
    setFormData(merged);
    const ok = draft.save(stepNumber, merged);
    if (ok) {
      toast.success("Progress saved");
    } else {
      toast.error("Couldn't save — your browser storage may be full or disabled");
    }
  };

  const handleEditStep = (step: number) => {
    goToStep(step, step < stepNumber ? "back" : "forward");
  };

  const handleSubmit = async () => {
    const { success, error } = await onSubmit(formData);

    if (success) {
      draft.clear();
      if (onSuccess) onSuccess();
    } else {
      if (onError) onError(error || "Unknown error");
    }
  };

  return (
    <>
      {preFilledNotice && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm text-[var(--ui-text-muted)]">
          <span>
            ✦ Some fields were pre-filled from your existing profile — review and update as needed.
          </span>
          <button
            type="button"
            onClick={() => setPreFilledNotice(false)}
            className="shrink-0 text-[var(--ui-text-subtle)] hover:text-[var(--ui-text-muted)]"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      <OnboardingProgressBar
        currentStep={stepNumber}
        totalSteps={TOTAL_STEPS}
        onStepClick={handleEditStep}
        completedSteps={getCompletedSteps(formData, visitedSteps)}
      />

      {/* Step container — GSAP slides this div between steps */}
      <div ref={containerRef} className="will-change-transform">
        {stepNumber === 1 && (
          <ProfilePhotoForm
            onNext={(newData) => advanceStep(newData, 2)}
            defaultValues={formData}
          />
        )}
        {stepNumber === 2 && (
          <AboutYouForm
            onBack={handleBack}
            onNext={(newData) => advanceStep(newData, 3)}
            onManualSave={handleManualSave}
            defaultValues={formData}
          />
        )}
        {stepNumber === 3 && (
          <StartupForm
            onBack={handleBack}
            onNext={(newData) => advanceStep(newData, 4)}
            onManualSave={handleManualSave}
            defaultValues={formData}
          />
        )}
        {stepNumber === 4 && (
          <BackgroundAndSocialsForm
            onBack={handleBack}
            onNext={(newData) => advanceStep(newData, 5)}
            onManualSave={handleManualSave}
            defaultValues={formData}
          />
        )}
        {stepNumber === 5 && (
          <InterestsAndValuesForm
            onBack={handleBack}
            onNext={(newData) => advanceStep(newData, 6)}
            onManualSave={handleManualSave}
            defaultValues={formData}
          />
        )}
        {stepNumber === 6 && (
          <ReviewForm
            data={formData}
            onBack={handleBack}
            onEdit={handleEditStep}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </>
  );
}

export default CreateProfile;
