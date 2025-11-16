import InterestsAndValuesForm from "@/app/onboarding/form-components/InterestsAndValuesForm";
import IntroAccomplishments from "@/app/onboarding/form-components/IntroAccomplishments";
import OnboardingSocialsForm from "@/app/onboarding/form-components/OnboardingSocialsForm";
import ProfilePhotoForm from "@/app/onboarding/form-components/ProfilePhotoForm";
import ReviewForm from "@/app/onboarding/form-components/ReviewForm";
import StartupDetailsForm from "@/app/onboarding/form-components/StartupDetailsForm";
import WhoYouAreForm from "@/app/onboarding/form-components/WhoYouAreForm";
import React, { useState } from "react";

type CreateProfileProps = {
  onSubmit: (
    formData: OnboardingData,
  ) => Promise<{ success: boolean; error?: string }>;
  initialData?: OnboardingData;
  // optionally, callbacks for success/failure, navigation, etc.
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

function CreateProfile({ onSubmit, onSuccess, onError }: CreateProfileProps) {
  const [stepNumber, setStepNumber] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});

  const handleBack = () => {
    setStepNumber((prev) => prev - 1);
  };

  const handleEditStep = (step: number) => {
    setStepNumber(step);
  };

  const handleSubmit = async () => {
    const { success, error } = await onSubmit(formData);

    if (success) {
      if (onSuccess) onSuccess();
    } else {
      if (onError) onError(error || "Unknown error");
    }
  };

  return (
    <>
      {stepNumber === 1 && (
        <ProfilePhotoForm
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(2);
          }}
          defaultValues={formData}
        />
      )}
      {stepNumber === 2 && (
        <WhoYouAreForm
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(3);
          }}
          defaultValues={formData} // pass current saved data here to pre-fill form
        />
      )}
      {stepNumber === 3 && (
        <IntroAccomplishments
          onBack={handleBack}
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(4);
          }}
          defaultValues={formData}
        />
      )}
      {stepNumber === 4 && (
        <OnboardingSocialsForm
          onBack={handleBack}
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(5);
          }}
          defaultValues={formData}
        />
      )}
      {stepNumber === 5 && (
        <StartupDetailsForm
          onBack={handleBack}
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(6);
          }}
          defaultValues={formData}
        />
      )}
      {stepNumber === 6 && (
        <InterestsAndValuesForm
          onBack={handleBack}
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(7);
          }}
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
