"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PricingTable, useUser } from "@clerk/nextjs";
import { useUserProfile } from "@/features/profile/useProfile";
import toast from "react-hot-toast";

export default function OnboardingNextPage() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [isNavigating, setIsNavigating] = useState(false);

  // Check if user has completed the onboarding form
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();

  useEffect(() => {
    if (!isLoaded) return;
    // optionally perform any side effects or analytics here
  }, [isLoaded]);

  const handleContinueToMatching = async () => {
    setIsNavigating(true);

    try {
      // Check if profile exists
      if (!profile) {
        // Check if user has onboarding data in Clerk metadata
        const onboardingComplete = user?.publicMetadata?.onboardingComplete;

        if (!onboardingComplete) {
          toast.error("Please complete your profile first", {
            duration: 4000,
            position: "bottom-right",
          });
          setIsNavigating(false);
          router.push("/onboarding");
          return;
        }

        // Profile wasn't created properly - redirect back to onboarding
        // Note: We no longer store full profile data in Clerk metadata to prevent JWT overflow
        toast.error(
          "Profile incomplete. Please complete your profile again.",
          {
            duration: 4000,
            position: "bottom-right",
          },
        );
        setIsNavigating(false);
        router.push("/onboarding");
        return;
      }

      // Profile exists, proceed to matching
      router.push("/cofoundr-matching");
    } catch {
      toast.error("Something went wrong. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      });
      setIsNavigating(false);
    }
  };

  return (
    <section className="section-height section-padding bg-(--charcoal-black) text-(--mist-white)">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="heading-5 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-400 sm:text-xl md:text-2xl">
            Select a plan to unlock matching and messaging features
          </p>
        </div>

        {/* Pricing Table */}
        <div className="mb-8">
          <div className="rounded-lg bg-gray-800/50 p-6">
            <PricingTable />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-end">
          <button
            className="translate-y flex cursor-pointer items-center rounded-md bg-(--mist-white) px-6 py-3 font-semibold text-(--charcoal-black) transition-all duration-300 hover:bg-white hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:px-8 sm:py-4"
            onClick={handleContinueToMatching}
            disabled={isNavigating || isProfileLoading}
          >
            {isNavigating ? "Loading..." : "Continue to Matching"}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help choosing? Contact our support team for personalized
            recommendations.
          </p>
        </div>
      </div>
    </section>
  );
}
