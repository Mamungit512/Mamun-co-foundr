"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { FaHeart, FaTimes, FaCrown } from "react-icons/fa";

interface SwipeLimitProps {
  currentCount: number;
  limit: number;
  hasReachedLimit: boolean;
}

export default function SwipeLimit({
  currentCount,
  limit,
  hasReachedLimit,
}: SwipeLimitProps) {
  const { has } = useAuth();
  const router = useRouter();

  // Check if user has the 10_swipes feature (free plan)
  const isOnFreePlan = has?.({ feature: "10_swipes" });
  // Check if user has unlimited swipes (Collab tier or higher)
  const hasUnlimitedSwipes = has?.({ feature: "unlimited_swipes" });

  // If user has unlimited swipes or is not on free plan, don't show limit
  if (!isOnFreePlan || hasUnlimitedSwipes || limit === Infinity) {
    return null;
  }

  const remainingSwipes = limit - currentCount;
  const progressPercentage = (currentCount / limit) * 100;

  const handleUpgrade = () => {
    router.push("/billing/upgrade");
  };

  if (hasReachedLimit) {
    return (
      <motion.div
        className="mb-6 overflow-hidden rounded-2xl border border-red-500/50 bg-red-900/20 p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <FaTimes className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-red-300">
          Daily Swipe Limit Reached
        </h3>
        <p className="mb-4 text-sm text-red-200">
          You&apos;ve used all {limit} of your daily swipes. Upgrade to continue
          discovering amazing co-founders!
        </p>
        <button
          onClick={handleUpgrade}
          className="rounded-md bg-yellow-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none"
        >
          <FaCrown className="mr-2 inline h-4 w-4" />
          Upgrade Now
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mb-6 overflow-hidden rounded-2xl border border-white bg-(--charcoal-black) p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <FaHeart className="h-4 w-4 text-pink-400" />
            <span className="text-sm font-medium text-gray-300">
              Daily Swipes
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {currentCount}/{limit}
            </span>
            <span className="text-xs text-gray-500">
              ({remainingSwipes} remaining)
            </span>
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          className="rounded-md bg-yellow-600/80 px-3 py-1 text-xs font-medium text-white transition hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none"
        >
          <FaCrown className="mr-1 inline h-3 w-3" />
          Upgrade
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="h-2 rounded-full bg-gray-700">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
