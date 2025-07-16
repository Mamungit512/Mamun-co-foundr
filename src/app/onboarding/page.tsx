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
  const [formData, setFormData] = useState<OnboardingData>({}); // Keeps track of cumulative data from each onboarding step
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const router = useRouter();

  // - Handles logic after user completes a page in the onboarding process -
  const handleNext = (stepData: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...stepData })); // Adds steps data to cumulative form data
    setStepNumber((prev) => prev + 1);
  };

  const handleBack = () => {
    setStepNumber((prev) => prev - 1);
  };

  const handleSubmit = async (finalStepData: Partial<OnboardingData>) => {
    const combinedData = { ...formData, ...finalStepData }; // Combines last steps data to cumulativ form data
    try {
      const res = await completeOnboarding(combinedData);
      if (res?.error) {
        setError(res.error);
      } else {
        await user?.reload(); // update Clerk metadata
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
      {stepNumber === 1 && <WhoYouAreForm onNext={handleNext} />}
      {stepNumber === 2 && (
        <IntroAccomplishments onBack={handleBack} onNext={handleNext} />
      )}
      {stepNumber === 3 && (
        <OnboardingSocialsForm onBack={handleBack} onNext={handleNext} />
      )}
      {stepNumber === 4 && (
        <StartupDetailsForm onBack={handleBack} onNext={handleNext} />
      )}
      {stepNumber === 5 && (
        <InterestsAndValuesForm onBack={handleBack} onNext={handleSubmit} />
      )}
    </section>
  );
}
