"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { FaHeart, FaLocationDot } from "react-icons/fa6";
import { TbMessageCircleFilled } from "react-icons/tb";
import BatteryLevel from "@/components/BatteryLevel";

type AISearchResultCardProps = {
  profile: OnboardingData & { matchReason: string; relevanceScore: number };
  onLike: (userId: string) => void;
  onMessage: (userId: string) => void;
  isLikeLoading: boolean;
  isMessageLoading: boolean;
};

export default function AISearchResultCard({
  profile,
  onLike,
  onMessage,
  isLikeLoading,
  isMessageLoading,
}: AISearchResultCardProps) {
  return (
    <motion.div
      className="overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/80 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-4 sm:p-5">
        <div className="flex gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full sm:h-20 sm:w-20">
            {profile.pfp_url ? (
              <Image
                src={profile.pfp_url}
                alt={`${profile.firstName} ${profile.lastName}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-700 text-2xl text-gray-400">
                👤
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-yellow-300">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="truncate text-sm text-gray-300">{profile.title}</p>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
              <FaLocationDot className="shrink-0 text-yellow-300" />
              <span className="truncate">
                {profile.city}, {profile.country}
              </span>
            </div>
            <div className="mt-1">
              <BatteryLevel level={profile.batteryLevel || "Content"} />
            </div>
          </div>

          <div className="flex shrink-0 items-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-300/10 text-sm font-bold text-yellow-300">
              {profile.relevanceScore}
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-gray-800/50 p-3">
          <p className="text-sm leading-relaxed text-gray-300">
            <span className="font-medium text-yellow-300/80">AI Match: </span>
            {profile.matchReason}
          </p>
        </div>

        {profile.personalIntro && (
          <p className="mt-3 line-clamp-2 text-sm text-gray-400">
            {profile.personalIntro}
          </p>
        )}

        <div className="mt-4 flex gap-3">
          <motion.button
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-pink-500/20 px-4 py-2.5 text-sm font-medium text-pink-400 transition-colors hover:bg-pink-500/30 disabled:opacity-50"
            onClick={() => profile.user_id && onLike(profile.user_id)}
            disabled={isLikeLoading || !profile.user_id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLikeLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-400 border-t-transparent" />
            ) : (
              <FaHeart className="h-4 w-4" />
            )}
            Like
          </motion.button>

          <motion.button
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500/20 px-4 py-2.5 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/30 disabled:opacity-50"
            onClick={() => profile.user_id && onMessage(profile.user_id)}
            disabled={isMessageLoading || !profile.user_id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isMessageLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            ) : (
              <TbMessageCircleFilled className="h-4 w-4" />
            )}
            Message
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
