"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PricingTable, useUser } from "@clerk/nextjs";

export default function OnboardingNextPage() {
  const router = useRouter();
  const { isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    // optionally perform any side effects or analytics here
  }, [isLoaded]);

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
            className="translate-y flex cursor-pointer items-center rounded-md bg-(--mist-white) px-6 py-3 font-semibold text-(--charcoal-black) transition-all duration-300 hover:bg-white hover:shadow-lg sm:px-8 sm:py-4"
            onClick={() => router.push("/cofoundr-matching")}
          >
            Continue to Matching
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
