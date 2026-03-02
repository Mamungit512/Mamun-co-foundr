"use client";

import { useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { completeOnboarding } from "./_actions";
import { useProfileUpsert } from "@/features/profile/useProfile";
import CreateProfile from "@/components/forms/CreateProfile";
import { posthog } from "@/lib/posthog";
import { trackEvent } from "@/lib/posthog-events";
import FirstPromoterSignup from "@/components/referrals/FirstPromoterSignup";

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

      // Identify user in PostHog after successful onboarding
      posthog.identify(userId, {
        email: user?.primaryEmailAddress?.emailAddress,
        first_name: formData.firstName,
        last_name: formData.lastName,
        city: formData.city,
        country: formData.country,
        is_technical: formData.isTechnical,
      });

      trackEvent.onboardingCompleted({
        city: formData.city,
        country: formData.country,
        is_technical: formData.isTechnical,
        has_startup: !!formData.startupName,
        cofounder_status: formData.coFounderStatus,
        priority_areas: formData.priorityAreas,
      });

      router.push("/onboarding/plan");

      return { success: true };
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMsg);
      // Keep direct posthog.captureException for error tracking
      if (typeof window !== "undefined" && window.posthog) {
        window.posthog.captureException(err);
      }
      return { success: false, error: errorMsg };
    }
  };

  return (
    <>
      <FirstPromoterSignup />
      <section className="section-height section-padding bg-(--charcoal-black) text-(--mist-white)">
        <div className="mx-auto max-w-4xl">
          {/* Page-level header */}
          <div className="mb-10">
            <p className="mb-2 text-xs font-semibold tracking-widest text-white/30 uppercase">
              Mamun Co-Foundr
            </p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Build your profile
            </h1>
            <p className="mt-2 text-base text-white/50">
              6 quick steps to find your ideal co-founder match.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <CreateProfile onSubmit={handleSubmit} onError={(e) => setError(e)} />
        </div>
      </section>
    </>
  );
}
