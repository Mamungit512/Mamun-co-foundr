"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaHeart, FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaCalendar } from "react-icons/fa6";
import { TbSend } from "react-icons/tb";
import { MdSkipNext } from "react-icons/md";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import HiringBadge from "@/components/HiringBadge";
import { useGetProfiles, useSearchProfiles } from "@/features/profile/useProfile";
import { useSchool } from "@/components/school/SchoolContext";
import { useToggleLike, useLikeStatus, useMutualLikes } from "@/features/likes/useLikes";
import { useCreateConversation } from "@/hooks/useConversations";
import { useSkipProfile } from "@/features/user-actions/useUserActions";
import { trackEvent } from "@/lib/posthog-events";
import { getSchoolFullName, getDegreeAbbreviation, SECTOR_INTEREST_LABELS } from "@/lib/utSchoolsAndMajors";

// ─── Search result card ────────────────────────────────────────────────────────

function SearchResultCard({
  profile,
  slug,
}: {
  profile: OnboardingData;
  slug: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const { toggleLike, isLoading: isLikeLoading } = useToggleLike();
  const { data: likeStatus } = useLikeStatus(profile.user_id);
  const createConversationMutation = useCreateConversation();

  const initials =
    (profile.firstName?.[0] ?? "").toUpperCase() +
    (profile.lastName?.[0] ?? "").toUpperCase();

  const degreeAbbrev =
    profile.utCollege && profile.utMajor
      ? getDegreeAbbreviation(profile.utCollege, profile.utMajor)
      : undefined;

  const yearSuffix = profile.gradYear
    ? `'${String(profile.gradYear).slice(-2)}`
    : undefined;

  const handleLike = async () => {
    if (!profile.user_id || isLikeLoading) return;
    try {
      await toggleLike(profile.user_id, likeStatus?.isLiked ?? false);
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profiles-search"] });
    } catch {
      toast.error("Failed to like profile");
    }
  };

  const handleMessage = async () => {
    if (!profile.user_id || isStartingConversation) return;
    setIsStartingConversation(true);
    try {
      await createConversationMutation.mutateAsync({ otherUserId: profile.user_id });
      router.push(`/school/${slug}/matches?tab=messages`);
    } catch {
      toast.error("Failed to start conversation");
    }
    setIsStartingConversation(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)]">
      <div className="p-4">
        {/* Avatar + name row */}
        <div className="mb-3 flex items-center gap-3">
          {profile.pfp_url ? (
            <Image
              src={profile.pfp_url}
              alt={`${profile.firstName} ${profile.lastName}`}
              width={48}
              height={48}
              className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--ui-surface-active)] text-sm font-bold text-[var(--ui-text)]">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-base font-bold text-[var(--ui-text)]">
                {profile.firstName} {profile.lastName}
              </span>
              {profile.utStatus && (
                <span className="inline-flex items-center rounded-md border border-[var(--ui-border-strong)] px-2 py-0.5 text-[10px] font-medium text-[var(--ui-text-muted)]">
                  {profile.utStatus === "student" ? "Student" : "Alumni"}
                </span>
              )}
              {profile.isTechnical && (
                <span className="inline-flex items-center rounded-md border border-[#bf5700] px-2 py-0.5 text-[10px] font-medium text-[#bf5700]">
                  {profile.isTechnical === "yes" ? "Technical" : "Non-technical"}
                </span>
              )}
            </div>
            {degreeAbbrev && yearSuffix && (
              <p className="mt-0.5 text-xs text-[var(--ui-text-muted)]">
                {degreeAbbrev} {yearSuffix}
              </p>
            )}
          </div>
        </div>

        {/* Bio snippet */}
        {profile.personalIntro && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-[var(--ui-text-muted)]">
            {profile.personalIntro}
          </p>
        )}

        {/* Sector tags (max 3) */}
        {profile.utSectorInterests && profile.utSectorInterests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.utSectorInterests.slice(0, 3).map((interest: string, i: number) => (
              <span
                key={interest}
                className="rounded-md px-2 py-0.5 text-xs font-medium"
                style={
                  i === 0
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
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-[var(--ui-border)] px-4 py-3">
        <button
          onClick={handleMessage}
          disabled={isStartingConversation}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#bf5700] py-2.5 text-white transition hover:bg-[#a04e00] disabled:opacity-50 cursor-pointer"
        >
          <TbSend className="h-4 w-4" />
          <span className="text-sm font-medium">Message</span>
        </button>

        <button
          onClick={handleLike}
          disabled={isLikeLoading}
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition cursor-pointer ${
            likeStatus?.isLiked
              ? "bg-pink-500 text-white"
              : "border border-[var(--ui-border-strong)] text-[var(--ui-text-muted)] hover:border-pink-400 hover:text-pink-400"
          }`}
        >
          <FaHeart className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main dashboard page ───────────────────────────────────────────────────────

export default function SchoolDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [slug, setSlug] = useState<string>("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  // Resolve slug once
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  const { schoolName } = useSchool();
  const { data: profiles } = useGetProfiles();
  const { data: searchResults, isFetching: isSearching } = useSearchProfiles(searchQuery);
  const { toggleLike, isLoading: isLikeLoading } = useToggleLike();
  useMutualLikes();
  const createConversationMutation = useCreateConversation();
  const skipProfileMutation = useSkipProfile();

  const isSearchActive = searchQuery.trim().length >= 2;
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
    if (!curProfile?.user_id || !curProfile?.isNew || isSearchActive) return;

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
    if (node) observer.observe(node);
    return () => { if (node) observer.unobserve(node); };
  }, [curProfile?.user_id, curProfile?.isNew, isSearchActive]);

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

  // ── Helpers for swipe card ──
  const isOnline = curProfile?.last_active_at
    ? new Date().getTime() - new Date(curProfile.last_active_at).getTime() < 5 * 60 * 1000
    : false;

  const initials = curProfile
    ? (curProfile.firstName?.[0] ?? "").toUpperCase() + (curProfile.lastName?.[0] ?? "").toUpperCase()
    : "";

  const degreeAbbrev =
    curProfile?.utCollege && curProfile?.utMajor
      ? getDegreeAbbreviation(curProfile.utCollege, curProfile.utMajor)
      : undefined;

  const yearSuffix = curProfile?.gradYear
    ? `'${String(curProfile.gradYear).slice(-2)}`
    : undefined;

  const schoolFullName = curProfile?.utCollege
    ? getSchoolFullName(curProfile.utCollege)
    : undefined;

  return (
    <div className="mx-auto max-w-2xl p-4 pt-6">
      {brandingHeader}

      {/* Search bar */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2.5">
        <IoSearchOutline className="h-4 w-4 flex-shrink-0 text-[var(--ui-text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by skill, major, industry…"
          className="flex-1 bg-transparent text-sm text-[var(--ui-text)] placeholder:text-[var(--ui-text-muted)] outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="flex-shrink-0 text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] cursor-pointer"
          >
            <IoCloseOutline className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search results */}
      {isSearchActive ? (
        <div>
          {isSearching && (
            <p className="mb-4 text-center text-sm text-[var(--ui-text-muted)]">
              Searching…
            </p>
          )}
          {!isSearching && searchResults && searchResults.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-base font-semibold text-[var(--ui-text)]">No matches found</p>
              <p className="text-sm text-[var(--ui-text-muted)]">
                Try different keywords — skills, majors, industries, or city names work well.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-1 text-sm font-medium text-[#bf5700] hover:underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          )}
          {searchResults && searchResults.length > 0 && (
            <div className="flex flex-col gap-3">
              {searchResults.map((profile) => (
                <SearchResultCard key={profile.user_id} profile={profile} slug={slug} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Swipe card */
        !curProfile ? (
          <div className="flex min-h-[calc(100vh-260px)] flex-col items-center justify-center gap-4 text-center">
            <p className="text-xl font-semibold text-[var(--ui-text)]">
              No more co-founders to show right now
            </p>
            <p className="text-sm text-[var(--ui-text-muted)]">
              Check back later — more students from your program will be joining.
            </p>
          </div>
        ) : (
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
                    <div
                      className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[var(--ui-surface)] ${
                        isOnline ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </div>

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

                {curProfile.isTechnical && (
                  <div className="mb-3 inline-flex items-center rounded-md border border-[#bf5700] px-2.5 py-1 text-xs font-medium text-[#bf5700]">
                    {curProfile.isTechnical === "yes" ? "Technical founder" : "Non-technical founder"}
                  </div>
                )}

                {schoolFullName && curProfile.utMajor && (
                  <div className="mb-3 text-xs text-[var(--ui-text-muted)]">
                    {schoolFullName} — {curProfile.utMajor}
                  </div>
                )}

                {curProfile.is_hiring && <HiringBadge />}

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

                {curProfile.education && (
                  <div className="mb-4">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">Education</p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ui-text)]">{curProfile.education}</p>
                  </div>
                )}

                {curProfile.experience && (
                  <div className="mb-4">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">Experience</p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ui-text)]">{curProfile.experience}</p>
                  </div>
                )}

                {curProfile.accomplishments && (
                  <div className="mb-4">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">Accomplishments</p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ui-text)]">{curProfile.accomplishments}</p>
                  </div>
                )}

                {curProfile.hasStartup === "yes" && curProfile.startupName && (
                  <div className="mb-4">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">Startup</p>
                    <p className="font-medium text-[var(--ui-text)]">{curProfile.startupName}</p>
                    {curProfile.startupDescription && (
                      <p className="mt-0.5 text-sm leading-relaxed text-[var(--ui-text-muted)]">{curProfile.startupDescription}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {curProfile.startupTimeSpent && (
                        <span className="rounded-md bg-[var(--ui-surface-active)] px-2.5 py-1 text-xs text-[var(--ui-text-muted)]">{curProfile.startupTimeSpent}</span>
                      )}
                      {curProfile.startupFunding && (
                        <span className="rounded-md bg-[var(--ui-surface-active)] px-2.5 py-1 text-xs text-[var(--ui-text-muted)]">{curProfile.startupFunding}</span>
                      )}
                    </div>
                  </div>
                )}

                {(() => {
                  const links = [
                    curProfile.linkedin && { href: curProfile.linkedin, icon: <FaLinkedin className="h-3.5 w-3.5" />, label: "LinkedIn" },
                    curProfile.twitter && { href: curProfile.twitter, icon: <FaTwitter className="h-3.5 w-3.5" />, label: "Twitter / X" },
                    curProfile.git && { href: curProfile.git, icon: <FaGithub className="h-3.5 w-3.5" />, label: "GitHub" },
                    curProfile.personalWebsite && { href: curProfile.personalWebsite, icon: <FaGlobe className="h-3.5 w-3.5" />, label: "Website" },
                    curProfile.schedulingUrl && { href: curProfile.schedulingUrl, icon: <FaCalendar className="h-3.5 w-3.5" />, label: "Schedule a call" },
                  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[];
                  return links.length > 0 ? (
                    <div className="mb-1">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">Connect</p>
                      <div className="flex flex-wrap gap-2">
                        {links.map(({ href, icon, label }) => (
                          <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-full border border-[var(--ui-border)] px-3 py-1.5 text-xs font-medium text-[var(--ui-text-muted)] transition hover:border-[#bf5700] hover:text-[#bf5700]"
                          >
                            {icon}
                            {label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
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
        )
      )}
    </div>
  );
}
