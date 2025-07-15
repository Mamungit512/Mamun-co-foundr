"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { completeOnboarding } from "./_actions";
import WhoYouAreForm from "./WhoYouAreForm";
import OnboardingSocialsForm from "./OnboardingSocialsForm";

export default function OnboardingComponent() {
  const [error, setError] = React.useState("");
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const res = await completeOnboarding(formData);
    if (res?.message) {
      // Reloads the user's data from the Clerk API
      await user?.reload();
      router.push("/");
    }
    if (res?.error) {
      setError(res?.error);
    }
  };
  return (
    <section className="section-height section-padding bg-(--charcoal-black) text-(--mist-white)">
      <h1 className="heading-5">Welcome to Mamun Cofoundr Matching!</h1>
      <p className="heading-6 text-gray-500">
        To get started, tell us more about yourself
      </p>
      <form action={handleSubmit} className="mt-10 w-full">
        {/* --- Who You Are Section --- */}
        <WhoYouAreForm />
        <OnboardingSocialsForm />

        {error && <p className="text-red-600">Error: {error}</p>}
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
