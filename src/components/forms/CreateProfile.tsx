"use client";

import AboutYouForm from "@/app/onboarding/form-components/AboutYouForm";
import BackgroundAndSocialsForm from "@/app/onboarding/form-components/BackgroundAndSocialsForm";
import InterestsAndValuesForm from "@/app/onboarding/form-components/InterestsAndValuesForm";
import ProfilePhotoForm from "@/app/onboarding/form-components/ProfilePhotoForm";
import ReviewForm from "@/app/onboarding/form-components/ReviewForm";
import StartupForm from "@/app/onboarding/form-components/StartupForm";
import OnboardingProgressBar from "@/components/ui/OnboardingProgressBar";
import { useOnboardingDraft } from "@/hooks/useOnboardingDraft";
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
 * 2. About You (name, title, location, education, experience, intro, ummah, mindset, isTechnical)
 * 3. Startup (essentials + conditional detailed fields on one page)
 * 4. Additional Details (optional background + socials)
 * 5. Interests & Values
 * 6. Review
 */
const TOTAL_STEPS = 6;

function CreateProfile({ onSubmit, onSuccess, onError }: CreateProfileProps) {
  const draft = useOnboardingDraft();

  const [stepNumber, setStepNumber] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});

  useEffect(() => {
    const savedDraft = draft.load();
    if (savedDraft) {
      setStepNumber(savedDraft.step);
      setFormData(savedDraft.data);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advanceStep = (newData: Partial<OnboardingData>, nextStep: number) => {
    const merged = { ...formData, ...newData };
    setFormData(merged);
    setStepNumber(nextStep);
    draft.save(nextStep, merged);
  };

  const handleBack = () => {
    const prevStep = stepNumber - 1;
    setStepNumber(prevStep);
    draft.save(prevStep, formData);
  };

  const handleEditStep = (step: number) => {
    setStepNumber(step);
    draft.save(step, formData);
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
      />
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
    </>
  );
}

export default CreateProfile;
