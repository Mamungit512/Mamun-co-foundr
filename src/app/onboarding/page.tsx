"use client";

import { useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { completeOnboarding } from "./_actions";
import WhoYouAreForm from "./form-components/WhoYouAreForm";
import OnboardingSocialsForm from "./form-components/OnboardingSocialsForm";
import IntroAccomplishments from "./form-components/IntroAccomplishments";
import StartupDetailsForm from "./form-components/StartupDetailsForm";
import InterestsAndValuesForm from "./form-components/InterestsAndValuesForm";
import ReviewForm from "./form-components/ReviewForm";
import { OnboardingData } from "./types";
import { useProfileUpsert } from "@/services/useProfile";

export default function OnboardingComponent() {
  const [stepNumber, setStepNumber] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();

  const { mutateAsync: upsertProfileMutationFn } = useProfileUpsert();

  const handleBack = () => {
    setStepNumber((prev) => prev - 1);
  };

  const handleEditStep = (step: number) => {
    setStepNumber(step);
  };

  const handleSubmit = async () => {
    try {
      // Upsert into supabase
      const userId = user?.id;
      const token = await session?.getToken();

      if (!userId || !token) {
        return { message: "No Logged In User or Missing Token" };
      }

      // -- Upsert OnboardingData into DB --
      const { success, error } = await upsertProfileMutationFn(formData);

      if (!success) {
        setError(error || "Unknown error");
        return;
      }

      // -- Complete Onboarding -> Update Clerk Metadata --
      const res = await completeOnboarding(formData);

      if (res?.error) {
        setError(res.error);
      } else {
        await user?.reload();
        router.push("/cofoundr-matching");
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
