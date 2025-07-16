"use client";

import { useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";

// import { completeOnboarding } from "./_actions";
import WhoYouAreForm from "./form-components/WhoYouAreForm";
import OnboardingSocialsForm from "./form-components/OnboardingSocialsForm";
import IntroAccomplishments from "./form-components/IntroAccomplishments";
import StartupDetailsForm from "./form-components/StartupDetailsForm";
import InterestsAndValuesForm from "./form-components/InterestsAndValuesForm";

export default function OnboardingComponent() {
  const [stepNumber, setStepNumber] = useState(1);

  // const { user } = useUser();
  // const router = useRouter();

  // - Handles logic after user completes a page in the onboarding process -
  const handleNext = () => {
    setStepNumber((prev) => prev + 1);
  };

  const handleBack = () => {
    setStepNumber((prev) => prev - 1);
  };

  // const handleSubmit = async (formData: FormData) => {
  //   try {
  //     // send formData to your server
  //     console.log("Final submission:", formData);
  //     // Redirect or show success message
  //   } catch (err) {
  //     setError("Something went wrong.");
  //     console.error(err);
  //   }
  //   // const res = await completeOnboarding(formData);
  //   // if (res?.message) {
  //   //   // Reloads the user's data from the Clerk API
  //   //   await user?.reload();
  //   //   router.push("/");
  //   // }
  //   // if (res?.error) {
  //   //   setError(res?.error);
  //   // }
  // };
  return (
    <section className="section-height section-padding bg-(--charcoal-black) text-(--mist-white)">
      <h1 className="heading-5">Welcome to Mamun Cofoundr Matching!</h1>
      <p className="heading-6 text-gray-500">
        To get started, tell us more about yourself
      </p>

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
        <InterestsAndValuesForm onBack={handleBack} onNext={handleNext} />
      )}
    </section>
  );
}
