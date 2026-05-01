"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaHeart, FaLocationDot } from "react-icons/fa6";
import { TbMessageCircleFilled } from "react-icons/tb";
import { MdSkipNext } from "react-icons/md";
import { CiCircleInfo } from "react-icons/ci";
import { motion, AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import BatteryLevel from "@/components/BatteryLevel";
import ActivityIndicator from "@/components/ActivityIndicator";
import HiringBadge from "@/components/HiringBadge";
import InformationTooltipButton from "@/components/ui/InformationTooltipButton";
import SwipeLimit from "@/components/SwipeLimit";
import { useGetProfiles } from "@/features/profile/useProfile";
import { useSchool } from "@/components/school/SchoolContext";
import { useToggleLike, useLikeStatus, useMutualLikes } from "@/features/likes/useLikes";
import { useCreateConversation } from "@/hooks/useConversations";
import { useSkipProfile } from "@/features/user-actions/useUserActions";
import { useSwipeLimit } from "@/features/swipes/useSwipes";
import { trackEvent } from "@/lib/posthog-events";

export default function SchoolDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [showMore, setShowMore] = useState(false);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { schoolName } = useSchool();
  const { data: profiles } = useGetProfiles();
  const { toggleLike, isLoading: isLikeLoading } = useToggleLike();
  const { data: mutualLikes } = useMutualLikes();
  const createConversationMutation = useCreateConversation();
  const skipProfileMutation = useSkipProfile();
  const { data: swipeLimitData } = useSwipeLimit();

  const curProfile = profiles?.[0];
  const { data: likeStatus } = useLikeStatus(curProfile?.user_id);

  React.useEffect(() => {
    if (curProfile?.user_id) {
      trackEvent.profileViewed(curProfile.user_id, "school_matching", {
        profile_index: 0,
      });
    }
  }, [curProfile?.user_id]);

  const handleLike = async () => {
    if (!curProfile?.user_id || isLikeLoading) return;
    try {
      await toggleLike(curProfile.user_id, likeStatus?.isLiked ?? false);
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    } catch {
      toast.error("Failed to like profile");
    }
  };

  const handleSkip = async () => {
    if (!curProfile?.user_id) return;
    try {
      await skipProfileMutation.mutateAsync(curProfile.user_id);
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    } catch {
      toast.error("Failed to skip profile");
    }
  };

  const handleMessage = async () => {
    if (!curProfile?.user_id || isStartingConversation) return;
    const resolvedParams = await params;
    setIsStartingConversation(true);
    try {
      const result = await createConversationMutation.mutateAsync(
        curProfile.user_id,
      );
      if (result?.conversation?.id) {
        router.push(`/school/${resolvedParams.slug}/matches`);
      }
    } catch {
      toast.error("Failed to start conversation");
    } finally {
      setIsStartingConversation(false);
    }
  };

  const brandingHeader = (
    <div className="mb-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
        Mamun &times; {schoolName}
      </p>
      <h1 className="mt-0.5 text-base font-semibold text-white/80">
        Co-Founder Matching
      </h1>
    </div>
  );

  if (swipeLimitData?.hasReachedLimit) {
    return (
      <div className="mx-auto max-w-2xl p-4 pt-6">
        {brandingHeader}
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
          <SwipeLimit
            hasReachedLimit={swipeLimitData.hasReachedLimit}
            currentCount={swipeLimitData.currentCount}
            limit={swipeLimitData.limit}
          />
        </div>
      </div>
    );
  }

  if (!curProfile) {
    return (
      <div className="mx-auto max-w-2xl p-4 pt-6">
        {brandingHeader}
        <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center gap-4 text-center">
          <p className="text-xl font-semibold text-(--mist-white)">
            No more co-founders to show right now
          </p>
          <p className="text-sm text-white/50">
            Check back later — more students from your program will be joining.
          </p>
        </div>
      </div>
    );
  }

  const isMutualLike = mutualLikes?.matches?.some(
    (id: string) => id === curProfile.user_id,
  );

  return (
    <div className="mx-auto max-w-2xl p-4 pt-6">
      {brandingHeader}
      <AnimatePresence mode="wait">
        <motion.div
          key={curProfile.user_id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
        >
          {/* Profile picture */}
          <div className="relative h-72 w-full bg-white/10">
            {curProfile.pfp_url ? (
              <Image
                src={curProfile.pfp_url}
                alt={`${curProfile.firstName}'s photo`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/20">
                <FaLocationDot className="h-16 w-16" />
              </div>
            )}
            {isMutualLike && (
              <div className="absolute right-3 top-3 rounded-full bg-pink-500 px-3 py-1 text-xs font-semibold text-white">
                Mutual Match ❤️
              </div>
            )}
            {curProfile.is_hiring && <HiringBadge />}
          </div>

          {/* Profile info */}
          <div className="p-5">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-xl font-bold text-(--mist-white)">
                {curProfile.firstName} {curProfile.lastName}
              </h2>
              <ActivityIndicator lastActiveAt={curProfile.last_active_at} />
            </div>

            <p className="mb-1 text-sm text-white/60">{curProfile.title}</p>

            <div className="mb-3 flex items-center gap-1 text-xs text-white/40">
              <FaLocationDot className="h-3 w-3" />
              <span>
                {curProfile.city}, {curProfile.country}
              </span>
            </div>

            {curProfile.personalIntro && (
              <p className="mb-3 text-sm leading-relaxed text-white/70">
                {curProfile.personalIntro}
              </p>
            )}

            <BatteryLevel level={curProfile.batteryLevel} />

            {showMore && (
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm text-white/60">
                {curProfile.education && (
                  <p>
                    <span className="font-medium text-white/80">Education: </span>
                    {curProfile.education}
                  </p>
                )}
                {curProfile.experience && (
                  <p>
                    <span className="font-medium text-white/80">Experience: </span>
                    {curProfile.experience}
                  </p>
                )}
                {curProfile.accomplishments && (
                  <p>
                    <span className="font-medium text-white/80">
                      Accomplishments:{" "}
                    </span>
                    {curProfile.accomplishments}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => setShowMore((v) => !v)}
              className="mt-3 flex items-center gap-1 text-xs text-white/40 hover:text-white/70"
            >
              <CiCircleInfo className="h-4 w-4" />
              {showMore ? "Show less" : "Show more"}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
            <InformationTooltipButton text={<span>Skip for now</span>}>
              <button
                onClick={handleSkip}
                disabled={skipProfileMutation.isPending}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/40 transition hover:border-white/40 hover:text-white/70"
              >
                <MdSkipNext className="h-5 w-5" />
              </button>
            </InformationTooltipButton>

            <button
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`flex h-14 w-14 items-center justify-center rounded-full transition ${
                likeStatus?.isLiked
                  ? "bg-pink-500 text-white"
                  : "border border-white/20 text-white/60 hover:border-pink-400 hover:text-pink-400"
              }`}
            >
              <FaHeart className="h-6 w-6" />
            </button>

            <InformationTooltipButton text={<span>Send a message</span>}>
              <button
                onClick={handleMessage}
                disabled={isStartingConversation}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/40 transition hover:border-white/40 hover:text-white/70"
              >
                <TbMessageCircleFilled className="h-5 w-5" />
              </button>
            </InformationTooltipButton>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
