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
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
          You&apos;re all set!
        </h1>
        <p className="mb-8 text-gray-400">
          Thanks for completing your profile. Next, choose your plan or explore
          matches.
        </p>
        <PricingTable />
        <button
          className="rounded bg-green-600 px-4 py-2 text-white"
          onClick={() => router.push("/cofoundr-matching")}
        >
          Continue to Matching
        </button>
        {/*
        <div className="flex items-center justify-center gap-3">
          <button
            className="rounded bg-green-600 px-4 py-2 text-white"
            onClick={() => router.push("/cofoundr-matching")}
          >
            Continue to Matching
          </button>
          <button
            className="rounded bg-gray-700 px-4 py-2 text-white"
            onClick={() => router.push("/pricing")}
          >
            View Plans
          </button>
        </div> */}
      </div>
    </section>
  );
}
