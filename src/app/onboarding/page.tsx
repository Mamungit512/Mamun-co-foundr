"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { completeOnboarding } from "./_actions";
import WhoYouAreForm from "./form-components/WhoYouAreForm";
import OnboardingSocialsForm from "./form-components/OnboardingSocialsForm";
import IntroAccomplishments from "./form-components/IntroAccomplishments";
import StartupDetailsForm from "./form-components/StartupDetailsForm";
import InterestsAndValuesForm from "./form-components/InterestsAndValuesForm";
import ReviewForm from "./form-components/ReviewForm";

import type { WhoYouAreFormData } from "./form-components/WhoYouAreForm";
import type { OnboardingSocialsFormData } from "./form-components/OnboardingSocialsForm";
import type { IntroAccomplishmentsFormData } from "./form-components/IntroAccomplishments";
import type { StartupDetailsFormData } from "./form-components/StartupDetailsForm";
import type { InterestsAndValuesFormData } from "./form-components/InterestsAndValuesForm";

// Combine all individual form step types
export type OnboardingData = Partial<
  WhoYouAreFormData &
    IntroAccomplishmentsFormData &
    OnboardingSocialsFormData &
    StartupDetailsFormData &
    InterestsAndValuesFormData
>;

export default function OnboardingComponent() {
  const [stepNumber, setStepNumber] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const router = useRouter();

  const handleBack = () => {
    setStepNumber((prev) => prev - 1);
  };

  const handleEditStep = (step: number) => {
    setStepNumber(step);
  };

  const handleSubmit = async () => {
    try {
      const res = await completeOnboarding(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        await user?.reload();
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <section className="section-height section-padding bg-(--charcoal-black) text-(--mist-white)">
      <h1 className="heading-5">Welcome to Mamun Cofoundr Matching!</h1>
      <p className="heading-6 text-gray-500">
        To get started, tell us more about yourself
      </p>

      {error && <p className="text-red-500">{error}</p>}

      {stepNumber === 1 && (
        <WhoYouAreForm
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(2);
          }}
          defaultValues={formData} // pass current saved data here to pre-fill form
        />
      )}
      {stepNumber === 2 && (
        <IntroAccomplishments
          onBack={handleBack}
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(3);
          }}
          defaultValues={formData}
        />
      )}
      {stepNumber === 3 && (
        <OnboardingSocialsForm
          onBack={handleBack}
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(4);
          }}
          defaultValues={formData}
        />
      )}
      {stepNumber === 4 && (
        <StartupDetailsForm
          onBack={handleBack}
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(5);
          }}
          defaultValues={formData}
        />
      )}
      {stepNumber === 5 && (
        <InterestsAndValuesForm
          onBack={handleBack}
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(6);
          }}
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
    </section>
  );
}
