"use client";

import React from "react";
import { motion } from "motion/react";
import { FaCheck, FaStar } from "react-icons/fa";

export default function BillingUpgradePage() {
  const features = [
    "We're Hiring badge on your profile",
    "Direct email inquiries from potential candidates",
    "File upload capability for resumes",
    "Unlimited profile views",
  ];

  const handleUpgrade = () => {
    // In a real implementation, this would redirect to Clerk's billing page
    // For now, we'll show a success message
    alert("Redirecting to Clerk billing page...");
    // window.location.href = "/billing/checkout";
  };

  return (
    <div className="min-h-screen bg-(--charcoal-black) text-(--mist-white)">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="mb-4 text-4xl font-bold text-yellow-300">
            Upgrade to Collab Tier
          </h1>
          <p className="text-xl text-gray-300">
            Unlock powerful hiring features to attract top talent
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <div className="relative rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent p-8 shadow-2xl">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black">
                <FaStar className="h-4 w-4" />
                Most Popular
              </div>
            </div>

            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-white">
                Collab Tier
              </h2>
              <div className="mb-4 flex items-center justify-center gap-2">
                <span className="text-5xl font-bold text-yellow-300">
                  $3.99
                </span>
                <span className="text-gray-300">/month</span>
              </div>
              <p className="text-gray-400">
                Perfect for founders looking to hire top talent
              </p>
            </div>

            {/* Features List */}
            <div className="mb-8 space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex-shrink-0">
                    <FaCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={handleUpgrade}
              className="w-full rounded-lg bg-yellow-600 px-8 py-4 text-lg font-semibold text-black transition hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Upgrade Now
            </motion.button>

            <p className="mt-4 text-center text-sm text-gray-400">
              Cancel anytime. No long-term commitments.
            </p>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="rounded-lg bg-gray-800/50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Why Choose Collab Tier?
            </h3>
            <p className="text-gray-300">
              Stand out from the crowd and attract the best co-founders and
              employees for your startup. Our hiring badge increases your
              visibility and makes it easy for potential candidates to reach out
              directly.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
