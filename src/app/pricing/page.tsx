"use client";

import React, { useEffect } from "react";
import { motion } from "motion/react";
import { FaUsers, FaEnvelope, FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUser, PricingTable } from "@clerk/nextjs";
import { trackEvent } from "@/lib/posthog-events";

export default function PricingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  // Redirect authenticated users to the billing/upgrade page
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/billing/upgrade");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--charcoal-black)">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    );
  }

  // If signed in, show loading while redirecting
  if (isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--charcoal-black)">
        <div className="text-xl text-gray-300">Redirecting...</div>
      </div>
    );
  }

  // Track page view when component mounts
  const handlePageLoaded = () => {
    trackEvent.upgradePageViewed({
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
  };

  const valueProps = [
    {
      icon: FaUsers,
      title: "Attract Top Talent",
      description:
        "Stand out from the crowd with a professional hiring badge that catches the eye of potential co-founders and employees.",
    },
    {
      icon: FaEnvelope,
      title: "Direct Communication",
      description:
        "Skip the middleman - candidates can reach out directly to your hiring email with inquiries and applications.",
    },
    {
      icon: FaEye,
      title: "Increased Visibility",
      description:
        "Get noticed by more potential candidates as your profile becomes more prominent in search results.",
    },
  ];

  return (
    <div className="min-h-screen bg-(--charcoal-black) text-(--mist-white)">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onAnimationComplete={handlePageLoaded}
        >
          <h1 className="mb-4 text-4xl font-bold text-yellow-300">
            Founders Pass
          </h1>
          <p className="text-xl text-gray-300">
            Unlock powerful hiring features to attract top talent
          </p>
        </motion.div>

        {/* Value Propositions */}
        <motion.div
          className="mb-16 grid gap-8 md:grid-cols-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {valueProps.map((prop, index) => (
            <motion.div
              key={prop.title}
              className="rounded-lg bg-gray-800/50 p-6 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-yellow-500/20 p-4">
                  <prop.icon className="h-8 w-8 text-yellow-300" />
                </div>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-white">
                {prop.title}
              </h3>
              <p className="text-gray-300">{prop.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing Table */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <div className="rounded-2xl border border-gray-700 bg-gray-800/30 p-8">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-bold text-white">
                Choose Your Plan
              </h2>
              <p className="text-gray-300">
                Select the plan that works best for your startup journey
              </p>
            </div>
            <PricingTable />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
