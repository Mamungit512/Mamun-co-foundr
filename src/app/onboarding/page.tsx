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
        return { success: false, error: "No Logged In User or Missing Token" };
      }

      // -- Upsert OnboardingData into DB --
      const { success, error } = await upsertProfileMutationFn(formData);

      if (!success) {
        setError(error || "Unknown error");
        return {
          success: false,
          error: "Error upserting into profiles table",
        };
      }

      // -- Complete Onboarding -> Update Clerk Metadata --
      const res = await completeOnboarding(formData);

      if (res?.error) {
        setError(res.error);
      } else {
        // --- Sync Clerk pfp to Supabase Storage Bucket ---
        // try {
        //   const syncRes = await fetch("/api/sync-profile-pic");
        //   if (!syncRes.ok) throw new Error("Failed to sync profile pic");
        //   const { imageUrl } = await syncRes.json();
        //   console.log("Profile pic synced:", imageUrl);
        // } catch (syncErr) {
        //   console.error("Error syncing profile pic:", syncErr);
        // }

        await user?.reload();

        router.push("/cofoundr-matching");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }

    return { success: true };
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
