"use client";

import AboutYouForm from "@/app/onboarding/form-components/AboutYouForm";
import InterestsAndValuesForm from "@/app/onboarding/form-components/InterestsAndValuesForm";
import OnboardingSocialsForm from "@/app/onboarding/form-components/OnboardingSocialsForm";
import ProfilePhotoForm from "@/app/onboarding/form-components/ProfilePhotoForm";
import ReviewForm from "@/app/onboarding/form-components/ReviewForm";
import StartupDetailsForm from "@/app/onboarding/form-components/StartupDetailsForm";
import StartupEssentialsForm from "@/app/onboarding/form-components/StartupEssentialsForm";
import YourBackgroundForm from "@/app/onboarding/form-components/YourBackgroundForm";
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
 * Step flow (8 internal steps, step 6 auto-skipped if no startup):
 *
 * 1. Photo
 * 2. About You (essential personal + intro)
 * 3. Startup Essentials (hasStartup + name/description)
 * 4. Your Background (deferred personal fields)
 * 5. Socials
 * 6. Startup Details (deferred startup fields — skipped if no startup)
 * 7. Interests & Values
 * 8. Review
 */
const MAX_STEPS = 8;

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

  const hasStartupDetails = formData.hasStartup === "yes";
  const totalSteps = hasStartupDetails ? MAX_STEPS : MAX_STEPS - 1;
  const displayStep =
    !hasStartupDetails && stepNumber > 5 ? stepNumber - 1 : stepNumber;

  const advanceStep = (newData: Partial<OnboardingData>, nextStep: number) => {
    const merged = { ...formData, ...newData };
    setFormData(merged);
    setStepNumber(nextStep);
    draft.save(nextStep, merged);
  };

  const handleBack = () => {
    let prevStep = stepNumber - 1;
    if (stepNumber === 7 && !hasStartupDetails) {
      prevStep = 5;
    }
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

  // Display steps collapse step 6 (Startup Details) when no startup, so we
  // need to map a clicked display step back to the correct internal step.
  const handleProgressBarClick = (displayStepClicked: number) => {
    const internalStep =
      !hasStartupDetails && displayStepClicked >= 6
        ? displayStepClicked + 1
        : displayStepClicked;
    handleEditStep(internalStep);
  };

  return (
    <>
      <OnboardingProgressBar
        currentStep={displayStep}
        totalSteps={totalSteps}
        onStepClick={handleProgressBarClick}
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
        <StartupEssentialsForm
          onBack={handleBack}
          onNext={(newData) => advanceStep(newData, 4)}
          defaultValues={formData}
        />
      )}
      {stepNumber === 4 && (
        <YourBackgroundForm
          onBack={handleBack}
          onNext={(newData) => advanceStep(newData, 5)}
          defaultValues={formData}
        />
      )}
      {stepNumber === 5 && (
        <OnboardingSocialsForm
          onBack={handleBack}
          onNext={(newData) => {
            const nextStep = formData.hasStartup === "yes" ? 6 : 7;
            advanceStep(newData, nextStep);
          }}
          defaultValues={formData}
        />
      )}
      {stepNumber === 6 && (
        <StartupDetailsForm
          onBack={handleBack}
          onNext={(newData) => advanceStep(newData, 7)}
          defaultValues={formData}
        />
      )}
      {stepNumber === 7 && (
        <InterestsAndValuesForm
          onBack={handleBack}
          onNext={(newData) => advanceStep(newData, 8)}
          defaultValues={formData}
        />
      )}
      {stepNumber === 8 && (
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
