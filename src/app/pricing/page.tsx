"use client";

import React, { useEffect } from "react";
import { motion } from "motion/react";
import { FaCheck, FaUsers, FaEnvelope, FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUser, SignUpButton } from "@clerk/nextjs";
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
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">
              Select the plan that works best for your startup journey
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Freemium Plan */}
            <div className="relative rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
              <div className="mb-4">
                <h3 className="mb-2 text-xl font-bold text-white">Freemium</h3>
                <p className="text-sm text-gray-400">
                  Join the Ummatic movement—no cost, no barriers. The Freemium
                  tier lets you experience the foundation of Mamun: discover
                  potential co-founders, browse ideas, and take your first step
                  into a values-aligned entrepreneurial network.
                </p>
              </div>

              <div className="mb-6">
                <div className="mb-1">
                  <span className="text-4xl font-bold text-white">$0</span>
                </div>
                <p className="text-sm text-gray-400">Always free</p>
              </div>

              <ul className="mb-6 space-y-3">
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span>10 thoughtful profile swipes per day.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span>Basic profile with mission & values section.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span>Access to Mamun Newsletter</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span>Access to AI profile writer</span>
                </li>
              </ul>
            </div>

            {/* Monthly Plan */}
            <div className="relative rounded-2xl border-2 border-yellow-500/50 bg-gray-800/50 p-6">
              <div className="mb-4">
                <h3 className="mb-2 text-xl font-bold text-white">
                  The Founders Monthly Pass
                </h3>
                <p className="text-sm text-gray-400">
                  This tier is specifically designed for users who prefer a
                  monthly subscription, allowing them to pay for their service
                  on a month-to-month basis.
                </p>
              </div>

              <div className="mb-6">
                <div className="mb-1">
                  <span className="text-4xl font-bold text-yellow-300">
                    $6.99
                  </span>
                  <span className="text-xl text-gray-300">/month</span>
                </div>
                <p className="text-sm text-gray-400">Only billed monthly</p>
              </div>

              <ul className="mb-6 space-y-3">
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Hiring Badge</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Unlimited swipes</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Basic profile with mission & values section.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Access to Mamun Newsletter</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Locked-In Lifetime Rate</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Access to AI profile writer</span>
                </li>
              </ul>
            </div>

            {/* Annual Plan */}
            <div className="relative rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
              <div className="mb-4">
                <h3 className="mb-2 text-xl font-bold text-white">
                  Founders Annual Pass
                </h3>
                <p className="text-sm text-gray-400">
                  This tier is specifically designed for users who wish to opt
                  for a one-time payment covering the entire year service.
                </p>
              </div>

              <div className="mb-6">
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">$10.99</span>
                  <span className="text-xl text-gray-300">/month</span>
                </div>
                <p className="text-sm text-gray-400">Billed annually</p>
              </div>

              <ul className="mb-6 space-y-3">
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Hiring Badge</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Access to Mamun Newsletter</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Basic profile with mission & values section.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Unlimited swipes</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Annual pass</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Locked-In Lifetime Rate</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <FaCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>Access to AI profile writer</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4 text-lg text-gray-300">
              Ready to unlock the full potential of Mamun?
            </p>
            <SignUpButton mode="modal">
              <button className="rounded-lg bg-yellow-500 px-8 py-3 font-semibold text-gray-900 transition-all hover:bg-yellow-400 hover:shadow-lg">
                Sign Up to Get Started
              </button>
            </SignUpButton>
          </div>
        </motion.div>

        {/* Additional Benefits */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="rounded-lg bg-gray-800/50 p-8">
            <h3 className="mb-4 text-xl font-semibold text-white">
              What You Get with Founders Pass
            </h3>
            <p className="mb-6 text-gray-300">
              For just $6.99/month, transform your profile into a talent magnet.
              The hiring badge isn&apos;t just a visual indicator - it&apos;s
              your gateway to connecting with passionate co-founders and skilled
              employees who are ready to build something amazing with you.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <FaCheck className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">
                  Cancel anytime, no long-term commitments
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FaCheck className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">
                  Instant activation of hiring features
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FaCheck className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">
                  Professional hiring badge on your profile
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FaCheck className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">
                  Direct email inquiries from candidates
                </span>
              </div>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              View our{" "}
              <a
                href="/refund-policy"
                className="text-yellow-300 hover:underline"
              >
                Refund Policy
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
