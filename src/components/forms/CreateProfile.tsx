"use client";

import AboutYouForm from "@/app/onboarding/form-components/AboutYouForm";
import BackgroundAndSocialsForm from "@/app/onboarding/form-components/BackgroundAndSocialsForm";
import InterestsAndValuesForm from "@/app/onboarding/form-components/InterestsAndValuesForm";
import ProfilePhotoForm from "@/app/onboarding/form-components/ProfilePhotoForm";
import ReviewForm from "@/app/onboarding/form-components/ReviewForm";
import StartupForm from "@/app/onboarding/form-components/StartupForm";
import OnboardingProgressBar from "@/components/ui/OnboardingProgressBar";
import { useOnboardingDraft } from "@/hooks/useOnboardingDraft";
import { useStepTransition } from "@/hooks/useOnboardingAnimation";
import React, { useState, useEffect } from "react";

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

function CreateProfile({ onSubmit, onSuccess, onError }: CreateProfileProps) {
  const draft = useOnboardingDraft();
  const { containerRef, transition } = useStepTransition();

  const [stepNumber, setStepNumber] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    const savedDraft = draft.load();
    if (savedDraft) {
      setStepNumber(savedDraft.step);
      setFormData(savedDraft.data);
      // Treat every step before the saved step as already visited
      const visited = new Set<number>();
      for (let i = 1; i < savedDraft.step; i++) visited.add(i);
      setVisitedSteps(visited);
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
            defaultValues={formData}
          />
        )}
        {stepNumber === 3 && (
          <StartupForm
            onBack={handleBack}
            onNext={(newData) => advanceStep(newData, 4)}
            defaultValues={formData}
          />
        )}
        {stepNumber === 4 && (
          <BackgroundAndSocialsForm
            onBack={handleBack}
            onNext={(newData) => advanceStep(newData, 5)}
            defaultValues={formData}
          />
        )}
        {stepNumber === 5 && (
          <InterestsAndValuesForm
            onBack={handleBack}
            onNext={(newData) => advanceStep(newData, 6)}
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
