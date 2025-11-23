"use client";

import { useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { completeOnboarding } from "./_actions";
import { useProfileUpsert } from "@/features/profile/useProfile";
import CreateProfile from "@/components/forms/CreateProfile";

export default function OnboardingComponent() {
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();

  const { mutateAsync: upsertProfileMutationFn } = useProfileUpsert();

  const handleSubmit = async (formData: OnboardingData) => {
    try {
      // Upsert into supabase
      const userId = user?.id;
      const token = await session?.getToken();

      if (!userId || !token) {
        const errorMsg = "No Logged In User or Missing Token";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // -- Upsert OnboardingData into DB --
      const { success, error } = await upsertProfileMutationFn(formData);

      if (!success) {
        const errorMsg = error || "Unknown error";
        setError(errorMsg);
        return {
          success: false,
          error: "Error creating your profile. Please try again.",
        };
      }

      // -- Complete Onboarding -> Update Clerk Metadata --
      const res = await completeOnboarding(formData);

      if (res?.error) {
        setError(res.error);
        // Don't return here - profile is created, so we can proceed
      }

      await user?.reload();

      router.push("/onboarding/plan");

      return { success: true };
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  return (
    <section className="section-height section-padding bg-(--charcoal-black) text-(--mist-white)">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
          Welcome to Mamun Cofoundr Matching!
        </h1>
        <p className="mb-8 text-lg text-gray-500 sm:text-xl md:text-2xl">
          To get started, tell us more about yourself
        </p>

        {error && <p className="mb-4 text-red-500">{error}</p>}

        <CreateProfile onSubmit={handleSubmit} onError={(e) => setError(e)} />
      </div>
    </section>
  );
}
