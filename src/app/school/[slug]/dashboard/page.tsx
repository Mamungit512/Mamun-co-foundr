"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaHeart } from "react-icons/fa6";
import { TbSend } from "react-icons/tb";
import { MdSkipNext } from "react-icons/md";
import { motion, AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import HiringBadge from "@/components/HiringBadge";
import { useGetProfiles } from "@/features/profile/useProfile";
import { useSchool } from "@/components/school/SchoolContext";
import { useToggleLike, useLikeStatus, useMutualLikes } from "@/features/likes/useLikes";
import { useCreateConversation } from "@/hooks/useConversations";
import { useSkipProfile } from "@/features/user-actions/useUserActions";
import { trackEvent } from "@/lib/posthog-events";
import { getSchoolFullName, getDegreeAbbreviation, SECTOR_INTEREST_LABELS } from "@/lib/utSchoolsAndMajors";

export default function SchoolDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const { schoolName } = useSchool();
  const { data: profiles } = useGetProfiles();
  const { toggleLike, isLoading: isLikeLoading } = useToggleLike();
  useMutualLikes();
  const createConversationMutation = useCreateConversation();
  const skipProfileMutation = useSkipProfile();

  const curProfile = profiles?.[0];
  const { data: likeStatus } = useLikeStatus(curProfile?.user_id);

  React.useEffect(() => {
    if (curProfile?.user_id) {
      trackEvent.profileViewed(curProfile.user_id, "school_matching", {
        profile_index: 0,
      });
    }
  }, [curProfile?.user_id]);

  // Mark profile as seen when it enters viewport
  useEffect(() => {
    if (!curProfile?.user_id || !curProfile?.isNew) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetch(`/api/profiles/seen`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ candidate_user_id: curProfile.user_id }),
          }).catch((err) => console.error("Failed to mark as seen:", err));
        }
      },
      { threshold: 0.5 }
    );

    const node = cardRef.current;
    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [curProfile?.user_id, curProfile?.isNew]);

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
      await skipProfileMutation.mutateAsync({ skippedProfileId: curProfile.user_id });
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
      await createConversationMutation.mutateAsync({
        otherUserId: curProfile.user_id,
      });
    } catch {
      toast.error("Failed to start conversation");
    }
    setIsStartingConversation(false);
    router.push(`/school/${resolvedParams.slug}/matches?tab=messages`);
  };

  const brandingHeader = (
    <div className="mb-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ui-text-muted)]">
        Mamun &times; {schoolName}
      </p>
      <h1 className="mt-0.5 text-base font-semibold text-[var(--ui-text)]">
        Co-Founder Matching
      </h1>
    </div>
  );

  if (!curProfile) {
    return (
      <div className="mx-auto max-w-2xl p-4 pt-6">
        {brandingHeader}
        <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center gap-4 text-center">
          <p className="text-xl font-semibold text-[var(--ui-text)]">
            No more co-founders to show right now
          </p>
          <p className="text-sm text-[var(--ui-text-muted)]">
            Check back later — more students from your program will be joining.
          </p>
        </div>
      </div>
    );
  }

  // Helper: is profile online (active in last 5 minutes)
  const isOnline = curProfile.last_active_at
    ? new Date().getTime() - new Date(curProfile.last_active_at).getTime() < 5 * 60 * 1000
    : false;

  // Helper: get initials from first and last name
  const initials = (curProfile.firstName?.[0] ?? "").toUpperCase() +
    (curProfile.lastName?.[0] ?? "").toUpperCase();

  // Helper: get degree abbreviation
  const degreeAbbrev = curProfile.utCollege && curProfile.utMajor
    ? getDegreeAbbreviation(curProfile.utCollege, curProfile.utMajor)
    : undefined;

  // Helper: format year (e.g., 2025 → '25)
  const yearSuffix = curProfile.gradYear
    ? `'${String(curProfile.gradYear).slice(-2)}`
    : undefined;

  // Helper: get school full name
  const schoolFullName = curProfile.utCollege
    ? getSchoolFullName(curProfile.utCollege)
    : undefined;

  return (
    <div className="mx-auto max-w-2xl p-4 pt-6">
      {brandingHeader}
      <AnimatePresence mode="wait">
        <motion.div
          ref={cardRef}
          key={curProfile.user_id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)]"
        >
          {/* Card header with avatar, name, badges */}
          <div className="p-5">
            {/* Avatar + Name row */}
            <div className="mb-4 flex items-start gap-3">
              {/* Circular avatar with photo or initials fallback */}
              <div className="relative flex-shrink-0">
                {curProfile.pfp_url ? (
                  <Image
                    src={curProfile.pfp_url}
                    alt={`${curProfile.firstName} ${curProfile.lastName}`}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ui-surface-active)] text-lg font-bold text-[var(--ui-text)]">
                    {initials}
                  </div>
                )}
                {/* Online/Offline status dot */}
                <div
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[var(--ui-surface)] ${
                    isOnline ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </div>

              {/* Name, New badge, Degree */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-[var(--ui-text)]">
                    {curProfile.firstName} {curProfile.lastName}
                  </h2>
                  {curProfile.isNew && (
                    <span className="inline-flex rounded-md bg-[#bf5700] px-2 py-0.5 text-xs font-semibold text-white">
                      New
                    </span>
                  )}
                </div>
                {degreeAbbrev && yearSuffix && (
                  <div className="text-sm font-medium text-[var(--ui-text-muted)]">
                    {degreeAbbrev} {yearSuffix}
                  </div>
                )}
              </div>

              {/* Status + Archetype (right column, stacked) */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {curProfile.utStatus && (
                  <span className="inline-flex items-center rounded-md border border-[var(--ui-border-strong)] px-2.5 py-1 text-xs font-medium text-[var(--ui-text-muted)]">
                    {curProfile.utStatus === "student" ? "Student" : "Alumni"}
                  </span>
                )}
                {curProfile.archetype && (
                  <span className="inline-flex items-center rounded-md border border-[#bf5700] px-2.5 py-1 text-xs font-medium text-[#bf5700]">
                    {curProfile.archetype === "the_scaler"
                      ? "The Scaler"
                      : curProfile.archetype === "the_steward"
                        ? "The Steward"
                        : "The Architect"}
                  </span>
                )}
              </div>
            </div>

            {/* Founder type badge */}
            {curProfile.isTechnical && (
              <div className="mb-3 inline-flex items-center rounded-md border border-[#bf5700] px-2.5 py-1 text-xs font-medium text-[#bf5700]">
                {curProfile.isTechnical === "yes" ? "Technical founder" : "Non-technical founder"}
              </div>
            )}

            {/* Department */}
            {schoolFullName && curProfile.utMajor && (
              <div className="mb-3 text-xs text-[var(--ui-text-muted)]">
                {schoolFullName} — {curProfile.utMajor}
              </div>
            )}

            {/* Hiring badge */}
            {curProfile.is_hiring && <HiringBadge />}

            {/* About section */}
            {curProfile.personalIntro && (
              <div className="mb-4 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-active)] p-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
                  About
                </p>
                <p className="text-sm leading-relaxed text-[var(--ui-text)]">
                  {curProfile.personalIntro}
                </p>
              </div>
            )}

            {/* Category interests */}
            {curProfile.utSectorInterests && curProfile.utSectorInterests.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
                  Category Interests
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {curProfile.utSectorInterests.map((interest: string, i: number) => (
                    <span
                      key={interest}
                      className="rounded-md px-2.5 py-1 text-xs font-medium"
                      style={
                        i < 2
                          ? { backgroundColor: "#bf5700", color: "#fff" }
                          : {
                              backgroundColor: "var(--ui-surface-active)",
                              color: "var(--ui-text-muted)",
                            }
                      }
                    >
                      {SECTOR_INTEREST_LABELS[interest as keyof typeof SECTOR_INTEREST_LABELS] || interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 border-t border-[var(--ui-border)] px-5 py-4">
            <button
              onClick={handleSkip}
              disabled={skipProfileMutation.isPending}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[var(--ui-border-strong)] text-[var(--ui-text-muted)] transition hover:border-[var(--ui-text-muted)] hover:text-[var(--ui-text)] cursor-pointer"
            >
              <MdSkipNext className="h-5 w-5" />
            </button>

            <button
              onClick={handleMessage}
              disabled={isStartingConversation}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#bf5700] py-3 text-white transition hover:bg-[#a04e00] disabled:opacity-50 cursor-pointer"
            >
              <TbSend className="h-5 w-5" />
              <span className="text-sm font-medium">Message</span>
            </button>

            <button
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition cursor-pointer ${
                likeStatus?.isLiked
                  ? "bg-pink-500 text-white"
                  : "border border-[var(--ui-border-strong)] text-[var(--ui-text-muted)] hover:border-pink-400 hover:text-pink-400"
              }`}
            >
              <FaHeart className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
