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

import BatteryLevel from "@/components/BatteryLevel";
import PreferencesPanel from "@/app/cofoundr-matching/PreferencesPanel";
import InformationTooltipButton from "@/components/ui/InformationTooltipButton";
import { useGetProfiles, useUserProfile } from "@/features/profile/useProfile";
import CofoundrShowMore from "./CofoundrShowMore";

function CofoundrMatching() {
  const [curProfileIdx, setCurProfileIdx] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const queryClient = useQueryClient();

  const { data: profiles } = useGetProfiles();
  const { data: currentUserProfile } = useUserProfile();

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

  const curProfile = profiles[curProfileIdx];

  const handleNextProfile = () => {
    if (!profiles || profiles.length === 0) return;
    setCurProfileIdx((prev) => (prev + 1 < profiles.length ? prev + 1 : 0));
  };

  const handleLike = () => {
    // Handle like functionality
    console.log("Liked profile:", curProfile);
  };

  const handleMessage = () => {
    // Handle message functionality
    console.log("Message profile:", curProfile);
  };

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

        {/* Main Profile Card */}
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
            <div className="overflow-hidden rounded-2xl border border-gray-800/50 bg-gray-900/50 shadow-2xl backdrop-blur-sm">
              <div className="p-8 lg:p-12">
                <div className="flex flex-col items-center space-y-8">
                  {/* Profile Image Section - Centered on Top */}
                  <motion.div
                    className="relative flex justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  >
                    <div className="relative h-96 w-80">
                      {/* Decorative Arch */}
                      <Image
                        src="/img/arch1.svg"
                        alt="Decorative Arch"
                        fill
                        className="object-contain"
                      />

                      {/* Profile Image */}
                      <div className="absolute top-12 left-16 -z-20 h-80 w-48 overflow-hidden rounded-t-full">
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
                    className="w-full max-w-2xl space-y-6 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                  >
                    {/* Name and Battery */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="text-center">
                        <h2 className="heading-5 mb-2 text-yellow-300">
                          {curProfile.firstName} {curProfile.lastName}
                        </h2>
                        <p className="text-xl text-gray-300">
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
                    <div className="flex flex-col items-center justify-center space-y-3 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-8">
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
                                new venture. Options: Happy, Content, Browsing,
                                Unhappy.
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
                      <h3 className="heading-6 mb-3 font-bold text-yellow-300">
                        Bio
                      </h3>
                      <p className="leading-relaxed text-gray-300">
                        {curProfile.personalIntro}
                      </p>
                    </div>

                    {/* Key Information Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="heading-6 mb-2 font-bold text-yellow-300">
                          Technical
                        </h3>
                        <p className="text-gray-300">
                          {curProfile.isTechnical ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <h3 className="heading-6 mb-2 font-bold text-yellow-300">
                          Education
                        </h3>
                        <p className="text-gray-300">{curProfile.education}</p>
                      </div>
                    </div>

                    {/* Accomplishments */}
                    <div>
                      <h3 className="heading-6 mb-3 font-bold text-yellow-300">
                        Key Accomplishments
                      </h3>
                      <p className="text-gray-300">
                        {curProfile.accomplishments}
                      </p>
                    </div>

                    {/* Work Experience */}
                    <div>
                      <h3 className="heading-6 mb-3 font-bold text-yellow-300">
                        Work Experience
                      </h3>
                      <p className="text-gray-300">{curProfile.experience}</p>
                    </div>

                    {/* Ummah Vision */}
                    <div>
                      <h3 className="heading-6 mb-3 font-bold text-yellow-300">
                        Civilizational Engineering for the Ummah
                      </h3>
                      <p className="text-gray-300">{curProfile.ummah}</p>
                    </div>

                    {/* Show More Button */}
                    <div className="pt-4 text-center">
                      <motion.button
                        className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-6 py-3 text-gray-300 transition-all duration-200 hover:bg-gray-700/50"
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
                  className="mt-8"
                >
                  <div className="overflow-hidden rounded-2xl border border-gray-800/30 bg-gray-900/30 p-8 backdrop-blur-sm">
                    <CofoundrShowMore curProfile={curProfile} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Fixed Action Buttons - Bottom Middle */}
        <motion.div
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center gap-6">
            <motion.button
              className="group flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-red-500/20 text-red-400 shadow-2xl backdrop-blur-sm transition-all duration-200 hover:bg-red-500/30 hover:shadow-red-500/25"
              onClick={handleNextProfile}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ImCross className="size-7 transition-transform group-hover:scale-110" />
            </motion.button>

            <motion.button
              className="group flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-pink-500/20 text-pink-400 shadow-2xl backdrop-blur-sm transition-all duration-200 hover:bg-pink-500/30 hover:shadow-pink-500/25"
              onClick={handleLike}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaHeart className="size-8 transition-transform group-hover:scale-110" />
            </motion.button>

            <motion.button
              className="group flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-blue-500/20 text-blue-400 shadow-2xl backdrop-blur-sm transition-all duration-200 hover:bg-blue-500/30 hover:shadow-blue-500/25"
              onClick={handleMessage}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <TbMessageCircleFilled className="size-7 transition-transform group-hover:scale-110" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </ReactLenis>
  );
}

export default CofoundrMatching;
