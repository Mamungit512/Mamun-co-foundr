"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { FaHeart, FaLocationDot } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { TbMessageCircleFilled } from "react-icons/tb";
import { CiCircleInfo } from "react-icons/ci";
import { useLikedProfilesData } from "@/features/likes/useLikes";
import { useSession } from "@clerk/nextjs";
import { useCreateConversation } from "@/hooks/useConversations";
import { useRouter } from "next/navigation";
import BatteryLevel from "@/components/BatteryLevel";
import InformationTooltipButton from "@/components/ui/InformationTooltipButton";

interface LikedProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LikedProfilesModal({
  isOpen,
  onClose,
}: LikedProfilesModalProps) {
  const { session } = useSession();
  const router = useRouter();
  const { data: likedProfilesData, isLoading } = useLikedProfilesData();
  const createConversationMutation = useCreateConversation();
  const [selectedProfile, setSelectedProfile] = useState<OnboardingData | null>(
    null,
  );
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const detailScrollableRef = useRef<HTMLDivElement>(null);

  const likedProfiles = likedProfilesData?.profiles || [];

  const handleStartConversation = async (profile: OnboardingData) => {
    if (!session?.user?.id || !profile.user_id) return;

    setIsStartingConversation(true);
    try {
      const result = await createConversationMutation.mutateAsync({
        otherUserId: profile.user_id,
      });

      if (result.success) {
        // Navigate to the conversation
        router.push(`/messages/${result.conversation.id}`);
        onClose(); // Close the modal
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      // You could add a toast notification here
    } finally {
      setIsStartingConversation(false);
    }
  };

  // Focus the scrollable area when modal opens
  useEffect(() => {
    if (isOpen && scrollableRef.current) {
      scrollableRef.current.focus();
    }
  }, [isOpen]);

  // Focus the detail scrollable area when profile detail opens
  useEffect(() => {
    if (selectedProfile && detailScrollableRef.current) {
      detailScrollableRef.current.focus();
    }
  }, [selectedProfile]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative mx-4 flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <FaHeart className="text-pink-400" />
              <h2 className="text-2xl font-bold text-white">Liked Profiles</h2>
              <span className="rounded-full bg-pink-500/20 px-3 py-1 text-sm text-pink-300">
                {likedProfiles.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            >
              <FaTimes className="h-5 w-5 cursor-pointer" />
            </button>
          </div>

          {/* Content */}
          <div
            ref={scrollableRef}
            className="flex-1 overflow-y-auto p-6 focus:outline-none"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#4B5563 #1F2937",
              WebkitOverflowScrolling: "touch",
            }}
            tabIndex={0}
            onWheel={(e) => {
              // Ensure wheel events are handled by this element
              e.stopPropagation();
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-400 border-t-transparent"></div>
                <span className="ml-3 text-gray-300">
                  Loading liked profiles...
                </span>
              </div>
            ) : likedProfiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-gray-700/50 p-6">
                  <FaHeart className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  No Liked Profiles Yet
                </h3>
                <p className="text-gray-400">
                  Start swiping to find profiles you like! They&apos;ll appear
                  here.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {likedProfiles.map((profile) => (
                  <motion.div
                    key={profile.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 transition-all duration-200 hover:border-pink-500/50 hover:bg-gray-800"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    {/* Profile Image */}
                    <div className="relative h-48 w-full overflow-hidden">
                      {profile.pfp_url ? (
                        <Image
                          src={profile.pfp_url}
                          alt={`${profile.firstName} ${profile.lastName} Profile`}
                          fill
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-700 text-gray-400">
                          <span className="text-4xl">👤</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute right-4 bottom-4 left-4">
                        <h3 className="text-lg font-bold text-white">
                          {profile.firstName} {profile.lastName}
                        </h3>
                        <p className="text-sm text-gray-200">{profile.title}</p>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <BatteryLevel
                          level={profile.batteryLevel || "Content"}
                        />
                        <InformationTooltipButton
                          text={
                            <div className="absolute top-full left-1/2 mt-2 w-80 -translate-x-1/2 rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-white shadow-xl">
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

                      <div className="mb-3 flex items-center text-sm text-gray-300">
                        <FaLocationDot className="mr-2 text-yellow-300" />
                        <span>
                          {profile.city}, {profile.country}
                        </span>
                      </div>

                      <div className="mb-3">
                        <span className="text-sm text-gray-400">COS:</span>
                        <span className="ml-2 font-semibold text-yellow-300">
                          {profile.satisfaction}
                        </span>
                      </div>

                      <p className="line-clamp-3 text-sm text-gray-300">
                        {profile.personalIntro}
                      </p>

                      {/* Message Button */}
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartConversation(profile);
                          }}
                          disabled={isStartingConversation}
                          className="group flex cursor-pointer items-center gap-2 rounded-lg bg-blue-500/20 px-4 py-2 text-blue-400 transition-all duration-200 hover:bg-blue-500/30 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isStartingConversation ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
                          ) : (
                            <TbMessageCircleFilled className="h-4 w-4 transition-transform group-hover:scale-110" />
                          )}
                          <span className="text-sm font-medium">
                            {isStartingConversation ? "Starting..." : "Message"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Profile Detail Modal */}
        <AnimatePresence>
          {selectedProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedProfile(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative mx-4 flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex-shrink-0 border-b border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      {selectedProfile.firstName} {selectedProfile.lastName}
                    </h3>
                    <button
                      onClick={() => setSelectedProfile(null)}
                      className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                    >
                      <FaTimes className="h-5 w-5 cursor-pointer" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div
                  ref={detailScrollableRef}
                  className="flex-1 overflow-y-auto p-6 focus:outline-none"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#4B5563 #1F2937",
                    WebkitOverflowScrolling: "touch",
                  }}
                  tabIndex={0}
                  onWheel={(e) => {
                    // Ensure wheel events are handled by this element
                    e.stopPropagation();
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-yellow-300">Bio</h4>
                      <p className="text-gray-300">
                        {selectedProfile.personalIntro}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-yellow-300">
                        Education
                      </h4>
                      <p className="text-gray-300">
                        {selectedProfile.education}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-yellow-300">
                        Experience
                      </h4>
                      <p className="text-gray-300">
                        {selectedProfile.experience}
                      </p>
                    </div>

                    {selectedProfile.accomplishments && (
                      <div>
                        <h4 className="font-semibold text-yellow-300">
                          Accomplishments
                        </h4>
                        <p className="text-gray-300">
                          {selectedProfile.accomplishments}
                        </p>
                      </div>
                    )}

                    {/* Message Button */}
                    <div className="pt-4">
                      <button
                        onClick={() => handleStartConversation(selectedProfile)}
                        disabled={isStartingConversation}
                        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500/20 px-6 py-3 text-blue-400 transition-all duration-200 hover:bg-blue-500/30 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isStartingConversation ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
                        ) : (
                          <TbMessageCircleFilled className="h-5 w-5 transition-transform group-hover:scale-110" />
                        )}
                        <span className="font-medium">
                          {isStartingConversation
                            ? "Starting..."
                            : "Send Message"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
