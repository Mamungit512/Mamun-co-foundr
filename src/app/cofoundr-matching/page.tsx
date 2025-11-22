"use client";

import ReactLenis from "lenis/react";
import Image from "next/image";
import React, { useState } from "react";
import { CiCircleInfo } from "react-icons/ci";
import { FaHeart, FaLocationDot } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { TbMessageCircleFilled } from "react-icons/tb";
import { motion, AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import BatteryLevel from "@/components/BatteryLevel";
import PreferencesPanel from "@/app/cofoundr-matching/PreferencesPanel";
import InformationTooltipButton from "@/components/ui/InformationTooltipButton";
import HiringBadge from "@/components/HiringBadge";
import { useGetProfiles, useUserProfile } from "@/features/profile/useProfile";
import {
  useToggleLike,
  useLikeStatus,
  useMutualLikes,
} from "@/features/likes/useLikes";
import { useCreateConversation } from "@/hooks/useConversations";
import { useRouter } from "next/navigation";
import CofoundrShowMore from "./CofoundrShowMore";
import { useSkipProfile } from "@/features/user-actions/useUserActions";
import { useSwipeLimit } from "@/features/swipes/useSwipes";
import SwipeLimit from "@/components/SwipeLimit";

function CofoundrMatching() {
  const [curProfileIdx, setCurProfileIdx] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: profiles } = useGetProfiles();
  const { data: currentUserProfile } = useUserProfile();
  const { toggleLike, isLoading: isLikeLoading } = useToggleLike();
  const { data: mutualLikes } = useMutualLikes();
  const createConversationMutation = useCreateConversation();
  const skipProfileMutation = useSkipProfile();
  const { data: swipeLimitData } = useSwipeLimit();

  // Get current profile and like status
  const curProfile = profiles?.[curProfileIdx];
  const { data: likeStatus } = useLikeStatus(curProfile?.user_id);

  const onPreferencesChange = () => {
    // Invalidate profiles query to refetch with new preferences
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
  };

  if (!profiles || profiles.length === 0) {
    return (
      <ReactLenis root>
        <div className="min-h-screen bg-(--charcoal-black) text-(--mist-white)">
          {/* Header Section */}
          <motion.header
            className="px-6 py-8 sm:px-8 lg:px-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mx-auto max-w-7xl">
              <h1 className="heading-4 mb-2 text-center">
                Muslim Co-Foundr Matching
              </h1>
              <p className="text-center text-gray-300">
                Discover your perfect co-founder match
              </p>
            </div>
          </motion.header>

          {/* Main Content */}
          <motion.section
            className="px-6 pb-20 sm:px-8 lg:px-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="mx-auto max-w-4xl">
              {/* Preferences Panel */}
              <PreferencesPanel
                currentPreferences={{
                  lookingFor: currentUserProfile?.lookingFor,
                  preferredLocation: currentUserProfile?.preferredLocation,
                }}
                onPreferencesChange={onPreferencesChange}
              />

              {/* No Profiles Message */}
              <div className="mt-8 overflow-hidden rounded-2xl border border-gray-800/50 bg-gray-900/50 shadow-2xl backdrop-blur-sm">
                <div className="p-8 lg:p-12">
                  <div className="flex flex-col items-center space-y-6 text-center">
                    <div className="mb-6">
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-700/50">
                        <FaHeart className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                    <h2 className="heading-5 mb-4 text-white">
                      No Profiles Found
                    </h2>
                    <p className="mb-2 text-gray-300">
                      No co-founder matches found with your current preferences.
                    </p>
                    <p className="text-sm text-gray-400">
                      Try adjusting your preferences above to see more potential
                      matches.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </ReactLenis>
    );
  }

  // Early return if no current profile
  if (!curProfile) {
    return null;
  }

  const handleNextProfile = () => {
    if (!profiles || profiles.length === 0) return;
    setCurProfileIdx((prev) => (prev + 1 < profiles.length ? prev + 1 : 0));
  };

  const handleSkip = async () => {
    if (!curProfile?.user_id) return;

    // Check if user has reached swipe limit
    if (swipeLimitData?.hasReachedLimit) {
      toast.error(
        "You've reached your daily swipe limit. Upgrade to continue!",
        {
          duration: 3000,
          position: "bottom-right",
        },
      );
      return;
    }

    try {
      await skipProfileMutation.mutateAsync({
        skippedProfileId: curProfile.user_id,
      });

      toast(`Skipped ${curProfile.firstName}`, {
        duration: 2000,
        position: "bottom-right",
        icon: "👋",
      });

      handleNextProfile();
    } catch (error) {
      console.error("Error skipping profile:", error);
      toast.error("Failed to skip profile. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      });
    }
  };

  const handleLike = async () => {
    if (!curProfile?.user_id) return;

    // Check if user has reached swipe limit
    if (swipeLimitData?.hasReachedLimit) {
      toast.error(
        "You've reached your daily swipe limit. Upgrade to continue!",
        {
          duration: 3000,
          position: "bottom-right",
        },
      );
      return;
    }

    try {
      const isCurrentlyLiked = likeStatus?.isLiked || false;
      await toggleLike(curProfile.user_id, isCurrentlyLiked);

      // Show toast notification
      if (!isCurrentlyLiked) {
        // Check if this creates a mutual match
        const isMutualMatch = mutualLikes?.matches?.includes(
          curProfile.user_id,
        );

        if (isMutualMatch) {
          toast.success(
            `🎉 It's a match! You and ${curProfile.firstName} liked each other!`,
            {
              duration: 5000,
              position: "bottom-right",
              style: {
                background: "#10B981",
                color: "white",
                fontWeight: "bold",
              },
            },
          );
        } else {
          toast.success(`You liked ${curProfile.firstName}! 💖`, {
            duration: 3000,
            position: "bottom-right",
          });
        }
      } else {
        toast.success(`You unliked ${curProfile.firstName}`, {
          duration: 2000,
          position: "bottom-right",
        });
      }

      // Move to next profile after liking
      handleNextProfile();
    } catch (error) {
      console.error("Error liking profile:", error);
      toast.error("Failed to like profile. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      });
    }
  };

  const handleMessage = async () => {
    if (!curProfile?.user_id) return;

    setIsStartingConversation(true);
    try {
      const result = await createConversationMutation.mutateAsync({
        otherUserId: curProfile.user_id,
      });

      if (result.success) {
        // Navigate to the conversation
        router.push(`/messages/${result.conversation.id}`);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
    } finally {
      setIsStartingConversation(false);
    }
  };

  return (
    <ReactLenis root>
      <div className="min-h-screen bg-(--charcoal-black) text-(--mist-white)">
        {/* Header Section */}
        <motion.header
          className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mx-auto max-w-7xl">
            <h1 className="mb-2 text-center text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
              Muslim Co-Foundr Matching
            </h1>
            <p className="text-center text-sm text-gray-300 sm:text-base md:text-lg">
              Discover your perfect co-founder match
            </p>
          </div>
        </motion.header>

        {/* Main Profile Card */}
        <motion.section
          className="px-4 pb-20 sm:px-6 sm:pb-24 md:px-8 lg:px-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <div className="mx-auto max-w-5xl">
            {/* Preferences Panel */}
            <PreferencesPanel
              currentPreferences={{
                lookingFor: currentUserProfile?.lookingFor,
                preferredLocation: currentUserProfile?.preferredLocation,
              }}
              onPreferencesChange={onPreferencesChange}
            />

            {/* Swipe Limit Display */}
            {swipeLimitData && (
              <SwipeLimit
                currentCount={swipeLimitData.currentCount}
                limit={swipeLimitData.limit}
                hasReachedLimit={swipeLimitData.hasReachedLimit}
              />
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-800/50 bg-gray-900/50 shadow-2xl backdrop-blur-sm">
              <div className="p-4 sm:p-6 md:p-8 lg:p-12">
                <div className="flex flex-col items-center space-y-6 sm:space-y-8">
                  {/* Profile Image Section - Centered on Top */}
                  <motion.div
                    className="relative flex justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  >
                    <div className="relative h-64 w-48 sm:h-80 sm:w-64 md:h-96 md:w-80">
                      {/* Decorative Arch */}
                      <Image
                        src="/img/arch1.svg"
                        alt="Decorative Arch"
                        fill
                        className="object-contain"
                      />

                      {/* Profile Image */}
                      <div className="absolute top-8 left-8 -z-20 h-48 w-32 overflow-hidden rounded-t-full sm:top-12 sm:left-16 sm:h-80 sm:w-48">
                        {curProfile?.pfp_url ? (
                          <Image
                            src={curProfile.pfp_url}
                            alt={`${curProfile.firstName} ${curProfile.lastName} Profile`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-700 text-gray-400">
                            <span className="text-4xl">👤</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Profile Information - Below Image */}
                  <motion.div
                    className="w-full max-w-3xl space-y-4 text-center sm:space-y-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                  >
                    {/* Name and Battery */}
                    <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                      <div className="text-center">
                        <div className="mb-2 flex items-center justify-center gap-3">
                          <h2 className="text-xl font-bold text-yellow-300 sm:text-2xl md:text-3xl lg:text-4xl">
                            {curProfile.firstName} {curProfile.lastName}
                          </h2>
                          {curProfile.isHiring && curProfile.hiringEmail && (
                            <HiringBadge
                              hiringEmail={curProfile.hiringEmail}
                              companyName={curProfile.startupName}
                            />
                          )}
                        </div>
                        <p className="text-base text-gray-300 sm:text-lg md:text-xl">
                          {curProfile.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <BatteryLevel
                          level={curProfile.batteryLevel || "Content"}
                        />
                        <InformationTooltipButton
                          text={
                            <div className="absolute top-full left-1/2 mt-2 w-80 -translate-x-1/2 rounded-lg border border-gray-700 bg-(--charcoal-black) p-4 text-sm text-white shadow-xl">
                              <p className="mb-3 font-semibold">
                                The Founder&apos;s Battery:
                              </p>
                              <p className="text-gray-300">
                                Users can update their &apos;battery level&apos;
                                to indicate their readiness—whether they&apos;re
                                Energized, Content, or Burnt out—ensuring better
                                matches and stronger startup collaborations.
                              </p>
                            </div>
                          }
                        >
                          <CiCircleInfo className="text-gray-400 transition-colors hover:text-yellow-300" />
                        </InformationTooltipButton>
                      </div>
                    </div>

                    {/* Location and COS */}
                    <div className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-6 md:space-x-8">
                      <div className="flex items-center text-gray-300">
                        <FaLocationDot className="mr-2 text-yellow-300" />
                        <span>
                          {curProfile.city}, {curProfile.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">COS:</span>
                        <span className="font-semibold text-yellow-300">
                          {curProfile.satisfaction}
                        </span>
                        <InformationTooltipButton
                          text={
                            <div className="absolute top-full left-1/2 mt-2 w-80 -translate-x-1/2 rounded-lg border border-gray-700 bg-(--charcoal-black) p-4 text-sm text-white shadow-xl">
                              <p className="mb-3 font-semibold">
                                Current Occupation Satisfaction:
                              </p>
                              <p className="text-gray-300">
                                A gauge of your overall contentment with your
                                career path and your motivation for seeking a
                                new venture. Options: Happy, Content, Browsing .
                              </p>
                            </div>
                          }
                        >
                          <CiCircleInfo className="text-gray-400 transition-colors hover:text-yellow-300" />
                        </InformationTooltipButton>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-yellow-300 sm:mb-3 sm:text-xl">
                        Bio
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-300 sm:text-base">
                        {curProfile.personalIntro}
                      </p>
                    </div>

                    {/* Key Information Grid */}
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                      <div>
                        <h3 className="mb-1 text-base font-bold text-yellow-300 sm:mb-2 sm:text-lg">
                          Technical
                        </h3>
                        <p className="text-sm text-gray-300 sm:text-base">
                          {curProfile.isTechnical ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <h3 className="mb-1 text-base font-bold text-yellow-300 sm:mb-2 sm:text-lg">
                          Education
                        </h3>
                        <p className="text-sm text-gray-300 sm:text-base">
                          {curProfile.education}
                        </p>
                      </div>
                    </div>

                    {/* Accomplishments */}
                    <div>
                      <h3 className="mb-2 text-base font-bold text-yellow-300 sm:mb-3 sm:text-lg">
                        Key Accomplishments
                      </h3>
                      <p className="text-sm text-gray-300 sm:text-base">
                        {curProfile.accomplishments}
                      </p>
                    </div>

                    {/* Work Experience */}
                    <div>
                      <h3 className="mb-2 text-base font-bold text-yellow-300 sm:mb-3 sm:text-lg">
                        Work Experience
                      </h3>
                      <p className="text-sm text-gray-300 sm:text-base">
                        {curProfile.experience}
                      </p>
                    </div>

                    {/* Ummah Vision */}
                    <div>
                      <h3 className="mb-2 text-base font-bold text-yellow-300 sm:mb-3 sm:text-lg">
                        What impact will you leave on the ummah or world?
                      </h3>
                      <p className="text-sm text-gray-300 sm:text-base">
                        {curProfile.ummah}
                      </p>
                    </div>

                    {/* Show More Button */}
                    <div className="pt-3 text-center sm:pt-4">
                      <motion.button
                        className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-4 py-2 text-sm text-gray-300 transition-all duration-200 hover:bg-gray-700/50 sm:px-6 sm:py-3 sm:text-base"
                        onClick={() => setShowMore((prev) => !prev)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {showMore ? "Show Less" : "Show More Details"}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Show More Section */}
            <AnimatePresence>
              {showMore && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mt-6 sm:mt-8"
                >
                  <div className="overflow-hidden rounded-2xl border border-gray-800/30 bg-gray-900/30 p-4 backdrop-blur-sm sm:p-6 md:p-8">
                    <CofoundrShowMore curProfile={curProfile} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Fixed Action Buttons - Bottom Middle */}
        <motion.div
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:bottom-6 md:bottom-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <motion.button
              className={`group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-red-500/20 text-red-400 shadow-2xl backdrop-blur-sm transition-all duration-200 hover:bg-red-500/30 hover:shadow-red-500/25 sm:h-14 sm:w-14 md:h-16 md:w-16 ${
                skipProfileMutation.isPending || swipeLimitData?.hasReachedLimit
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              onClick={handleSkip}
              disabled={
                skipProfileMutation.isPending || swipeLimitData?.hasReachedLimit
              }
              whileHover={
                !skipProfileMutation.isPending &&
                !swipeLimitData?.hasReachedLimit
                  ? { scale: 1.1 }
                  : {}
              }
              whileTap={
                !skipProfileMutation.isPending &&
                !swipeLimitData?.hasReachedLimit
                  ? { scale: 0.95 }
                  : {}
              }
            >
              {skipProfileMutation.isPending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-400 border-t-transparent sm:h-6 sm:w-6 md:h-7 md:w-7" />
              ) : (
                <ImCross className="size-5 transition-transform group-hover:scale-110 sm:size-6 md:size-7" />
              )}
            </motion.button>

            <motion.button
              className={`group flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-2xl backdrop-blur-sm transition-all duration-200 sm:h-16 sm:w-16 md:h-20 md:w-20 ${
                likeStatus?.isLiked
                  ? "bg-pink-500/40 text-pink-300 hover:bg-pink-500/50 hover:shadow-pink-500/25"
                  : "bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 hover:shadow-pink-500/25"
              } ${isLikeLoading || swipeLimitData?.hasReachedLimit ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={handleLike}
              disabled={isLikeLoading || swipeLimitData?.hasReachedLimit}
              whileHover={
                !isLikeLoading && !swipeLimitData?.hasReachedLimit
                  ? { scale: 1.1 }
                  : {}
              }
              whileTap={
                !isLikeLoading && !swipeLimitData?.hasReachedLimit
                  ? { scale: 0.95 }
                  : {}
              }
            >
              {isLikeLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-400 border-t-transparent sm:h-7 sm:w-7 md:h-8 md:w-8" />
              ) : (
                <FaHeart
                  className={`size-6 transition-transform sm:size-7 md:size-8 ${
                    likeStatus?.isLiked ? "fill-current" : ""
                  } ${!isLikeLoading && !swipeLimitData?.hasReachedLimit ? "group-hover:scale-110" : ""}`}
                />
              )}
            </motion.button>

            <motion.button
              className={`group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full shadow-2xl backdrop-blur-sm transition-all duration-200 hover:bg-blue-500/30 hover:shadow-blue-500/25 sm:h-14 sm:w-14 md:h-16 md:w-16 ${
                isStartingConversation
                  ? "cursor-not-allowed opacity-50"
                  : "bg-blue-500/20 text-blue-400"
              }`}
              onClick={handleMessage}
              disabled={isStartingConversation}
              whileHover={!isStartingConversation ? { scale: 1.1 } : {}}
              whileTap={!isStartingConversation ? { scale: 0.95 } : {}}
            >
              {isStartingConversation ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent sm:h-6 sm:w-6 md:h-7 md:w-7" />
              ) : (
                <TbMessageCircleFilled className="size-5 transition-transform group-hover:scale-110 sm:size-6 md:size-7" />
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </ReactLenis>
  );
}

export default CofoundrMatching;
