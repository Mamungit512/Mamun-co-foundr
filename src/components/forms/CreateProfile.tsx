"use client";

import InterestsAndValuesForm from "@/app/onboarding/form-components/InterestsAndValuesForm";
import IntroAccomplishments from "@/app/onboarding/form-components/IntroAccomplishments";
import OnboardingSocialsForm from "@/app/onboarding/form-components/OnboardingSocialsForm";
import ProfilePhotoForm from "@/app/onboarding/form-components/ProfilePhotoForm";
import ReviewForm from "@/app/onboarding/form-components/ReviewForm";
import StartupDetailsForm from "@/app/onboarding/form-components/StartupDetailsForm";
import WhoYouAreForm from "@/app/onboarding/form-components/WhoYouAreForm";
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
      {stepNumber === 1 && (
        <ProfilePhotoForm
          onNext={(newData) => advanceStep(newData, 2)}
          defaultValues={formData}
        />
      )}
      {stepNumber === 2 && (
        <WhoYouAreForm
          onNext={(newData) => advanceStep(newData, 3)}
          defaultValues={formData}
        />
      )}
      {stepNumber === 3 && (
        <IntroAccomplishments
          onBack={handleBack}
          onNext={(newData) => advanceStep(newData, 4)}
          defaultValues={formData}
        />
      )}
      {stepNumber === 4 && (
        <OnboardingSocialsForm
          onBack={handleBack}
          onNext={(newData) => advanceStep(newData, 5)}
          defaultValues={formData}
        />
      )}
      {stepNumber === 5 && (
        <StartupDetailsForm
          onBack={handleBack}
          onNext={(newData) => advanceStep(newData, 6)}
          defaultValues={formData}
        />
      )}
      {stepNumber === 6 && (
        <InterestsAndValuesForm
          onBack={handleBack}
          onNext={(newData) => advanceStep(newData, 7)}
          defaultValues={formData}
        />
      )}
      {stepNumber === 7 && (
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
