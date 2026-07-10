"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaPaperPlane, FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaCalendar } from "react-icons/fa6";
import { MdSkipNext } from "react-icons/md";
import { IoSearchOutline, IoCloseOutline, IoFilterOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import HiringBadge from "@/components/HiringBadge";
import CoFounderLinks from "@/features/cofounder/CoFounderLinks";
import ProfileViewModal from "@/features/profile/ProfileViewModal";
import { useGetProfiles, useSearchProfiles } from "@/features/profile/useProfile";
import { useSchool } from "@/features/school/components/SchoolContext";
import { useToggleLike, useLikeStatus, useMutualLikes } from "@/features/likes/useLikes";
import { useSkipProfile } from "@/features/user-actions/useUserActions";
import { trackEvent } from "@/lib/posthog-events";
import { useProfileViewTracking } from "@/features/profile/useProfileViewTracking";
import { getSchoolFullName, getDegreeAbbreviation, SECTOR_INTEREST_LABELS } from "@/features/school/data/utSchoolsAndMajors";
import FilterSidebar, { getFilterChipLabels } from "@/features/school/components/dashboard/FilterSidebar";
import ReportProfileButton from "@/features/report/ReportProfileButton";
import {
  type DashboardFilters,
  type RelaxSuggestion,
  EMPTY_DASHBOARD_FILTERS,
  hasActiveFilters,
  loadDashboardFilters,
  normalizeDashboardFilters,
  saveDashboardFilters,
} from "@/features/school/data/dashboardFilters";

// ─── Search result card ────────────────────────────────────────────────────────

function SearchResultCard({
  profile,
  onViewProfile,
  onViewProfileById,
}: {
  profile: OnboardingData;
  onViewProfile: (profile: OnboardingData) => void;
  onViewProfileById: (userId: string) => void;
}) {
  const queryClient = useQueryClient();
  const { toggleLike, isLoading: isLikeLoading } = useToggleLike();
  const { data: likeStatus } = useLikeStatus(profile.user_id);

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

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)]">
      <button
        type="button"
        onClick={() => onViewProfile(profile)}
        className="w-full p-4 text-left hover:bg-[var(--ui-surface-active)] transition cursor-pointer"
      >
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
                <span
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium text-white"
                  style={{
                    backgroundColor: profile.utStatus === "student" ? "#22c55e" : "#a855f7",
                  }}
                >
                  {profile.utStatus === "student" ? "Student" : "Alumni"}
                </span>
              )}
              {profile.isTechnical && (
                <span className="inline-flex items-center rounded-md border border-[#bf5700] px-2 py-0.5 text-[10px] font-medium text-[#a34800]">
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

        {profile.user_id && (
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <CoFounderLinks userId={profile.user_id} onClickCofounder={onViewProfileById} />
          </div>
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
      </button>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-[var(--ui-border)] px-4 py-3">
        <button
          onClick={handleLike}
          disabled={isLikeLoading}
          className={`flex h-10 px-3 flex-shrink-0 items-center justify-center gap-2 rounded-full transition cursor-pointer text-sm font-medium ${
            likeStatus?.isLiked
              ? "bg-pink-500 text-white"
              : "bg-[#BF5700] text-white hover:bg-[#a34800]"
          }`}
        >
          <FaPaperPlane className="h-3.5 w-3.5" />
          <span>Invite</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main dashboard page ───────────────────────────────────────────────────────

export default function SchoolDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_DASHBOARD_FILTERS);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [viewingProfile, setViewingProfile] = useState<OnboardingData | null>(null);

  const openProfile = (profile: OnboardingData) => {
    setViewingProfile(profile);
    setViewingUserId(null);
  };
  const openProfileById = (userId: string) => {
    setViewingUserId(userId);
    setViewingProfile(null);
  };
  const closeProfile = () => {
    setViewingUserId(null);
    setViewingProfile(null);
  };
  const queryClient = useQueryClient();
  const cardRef = useRef<HTMLDivElement>(null);

  const { schoolName, slug } = useSchool();
  const { data: profiles, isLoading: isLoadingProfiles } = useGetProfiles(filters, slug);

  useEffect(() => {
    setFilters(loadDashboardFilters());
  }, []);

  const updateFilters = (next: DashboardFilters) => {
    setFilters(next);
    saveDashboardFilters(next);
  };
  const { data: searchResults, isFetching: isSearching, inferred, emptyReason, dismissFilter } = useSearchProfiles(searchQuery, filters, slug);

  // Relax a single binding filter from the empty-results state. Inferred filters
  // are dismissed (Mode B re-search); user filters are cleared from the sidebar.
  const handleRelax = (s: RelaxSuggestion) => {
    if (s.source === "inferred") {
      s.dismissKeys.forEach((key) => dismissFilter(key));
      return;
    }
    const next: DashboardFilters = { ...filters, sectors: [...filters.sectors] };
    if (s.dimension === "sectors") next.sectors = [];
    else next[s.dimension] = null;
    updateFilters(next);
  };
  const { toggleLike, isLoading: isLikeLoading } = useToggleLike();
  useMutualLikes();
  const skipProfileMutation = useSkipProfile();

  const isSearchActive = searchQuery.trim().length >= 2;
  const filtersActive = hasActiveFilters(filters);
  const filterChips = getFilterChipLabels(filters);
  const curProfile = profiles?.[0];
  const { data: likeStatus } = useLikeStatus(curProfile?.user_id);

  useProfileViewTracking(curProfile?.user_id, cardRef);

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

  const brandingHeader = (
    <div className="mb-4 flex items-center justify-between">
      <div className="w-8" />
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest">
          <span className="text-[#84cc16]">Mamun</span>
          <span className="text-[var(--ui-text-muted)]"> &times; </span>
          <span className="text-[#a34800]">{schoolName}</span>
        </p>
        <h1 className="mt-0.5 text-base font-semibold text-[var(--ui-text)]">
          UT co-foundr Matching
        </h1>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setFilterDrawerOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff6f0] text-[#BF5700] hover:bg-[#ffe8d6] transition cursor-pointer lg:hidden"
          aria-label="Open filters"
        >
          <IoFilterOutline className="h-4 w-4" />
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff6f0] text-[#BF5700] hover:bg-[#ffe8d6] transition cursor-pointer"
          aria-label="Open search"
        >
          <IoSearchOutline className="h-4 w-4" />
        </button>
      </div>
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


  const activeFilterChipsRow =
    filtersActive && !isSearchActive ? (
      <div className="mb-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
          Active filters
        </p>
        <div className="flex flex-wrap gap-1.5">
          {filterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => updateFilters(chip.onRemove())}
              className="inline-flex items-center gap-1 rounded-md bg-[#bf5700] px-2.5 py-1 text-xs font-medium text-white cursor-pointer hover:bg-[#a34800]"
            >
              {chip.label}
              <span aria-hidden>&times;</span>
            </button>
          ))}
        </div>
      </div>
    ) : null;

  const inferredFilterChipsRow = isSearchActive && inferred && inferred.filters && Object.keys(inferred.filters).length > 0 ? (
    <div className="mb-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
        ✨ Understood as
      </p>
      <div className="flex flex-wrap gap-1.5">
        {getFilterChipLabels(normalizeDashboardFilters(inferred.filters)).map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => dismissFilter(chip.dismissKey)}
            className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 cursor-pointer hover:bg-blue-200 transition"
          >
            {chip.label}
            <span aria-hidden>&times;</span>
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className="mx-auto flex flex-1 min-h-0 max-w-5xl flex-col px-4 pt-6 pb-8">
      <ProfileViewModal profile={viewingProfile} userId={viewingUserId} onClose={closeProfile} />
      {brandingHeader}

      <FilterSidebar
        variant="drawer"
        filters={filters}
        onChange={updateFilters}
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      />

      {/* Search bar — only shown when open */}
      {searchOpen && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-[#BF5700] bg-[#fff6f0] px-3 py-2.5">
          <IoSearchOutline className="h-4 w-4 flex-shrink-0 text-[#BF5700]" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill, major, industry…"
            className="flex-1 bg-transparent text-sm text-[#3d1a00] placeholder:text-[#a34800] outline-none"
          />
          <button
            onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
            className="flex-shrink-0 text-[#BF5700] hover:text-[#8a3d00] cursor-pointer"
          >
            <IoCloseOutline className="h-4 w-4" />
          </button>
        </div>
      )}

      {activeFilterChipsRow}
      {inferredFilterChipsRow}

      <div className="flex flex-1 min-h-0 items-stretch gap-6">
        <FilterSidebar
          variant="sidebar"
          filters={filters}
          onChange={updateFilters}
        />

        <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-1 flex-col min-h-0">
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
              <p className="text-base font-semibold text-[var(--ui-text)]">No exact matches</p>
              {emptyReason && emptyReason.relaxations.length > 0 ? (
                <>
                  <p className="text-sm text-[var(--ui-text-muted)]">
                    Nobody fits all of your criteria. Relax one to see more:
                  </p>
                  <div className="mt-1 flex w-full max-w-xs flex-col items-stretch gap-2">
                    {emptyReason.relaxations.map((s) => (
                      <button
                        key={s.dimension}
                        type="button"
                        onClick={() => handleRelax(s)}
                        className="flex items-center justify-between gap-2 rounded-lg border border-[#bf5700]/30 bg-[#fff6f0] px-3 py-2 text-sm text-[#a34800] transition hover:bg-[#ffe8d6] cursor-pointer"
                      >
                        <span className="font-medium">Drop &ldquo;{s.label}&rdquo;</span>
                        <span className="flex-shrink-0 rounded-full bg-[#bf5700] px-2 py-0.5 text-xs font-semibold text-white">
                          +{s.countIfRelaxed}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--ui-text-muted)]">
                  Try different keywords — skills, majors, industries, or city names work well.
                </p>
              )}
              <button
                onClick={() => setSearchQuery("")}
                className="mt-1 text-sm font-medium text-[#a34800] hover:underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          )}
          {searchResults && searchResults.length > 0 && (
            <div className="flex flex-col gap-3">
              {searchResults.map((profile) => (
                <SearchResultCard key={profile.user_id} profile={profile} onViewProfile={openProfile} onViewProfileById={openProfileById} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Swipe card */
        isLoadingProfiles ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-[var(--ui-text-muted)]">Loading profiles…</p>
          </div>
        ) : !curProfile ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            {filtersActive ? (
              <>
                <p className="text-xl font-semibold text-[var(--ui-text)]">
                  No matches for these filters
                </p>
                <p className="text-sm text-[var(--ui-text-muted)]">
                  Try adjusting your filters or clear them to see more co-founders.
                </p>
                <button
                  type="button"
                  onClick={() => updateFilters(EMPTY_DASHBOARD_FILTERS)}
                  className="mt-1 text-sm font-medium text-[#a34800] hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <p className="text-xl font-semibold text-[var(--ui-text)]">
                  No more co-founders to show right now
                </p>
                <p className="text-sm text-[var(--ui-text-muted)]">
                  Check back later — more students from your program will be joining.
                </p>
              </>
            )}
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
              className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)]"
            >
              {/* Card header with avatar, name, badges */}
              <div className="flex-1 overflow-y-auto p-5">
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
                      <span
                        className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-white"
                        style={{
                          backgroundColor: curProfile.utStatus === "student" ? "#22c55e" : "#a855f7",
                        }}
                      >
                        {curProfile.utStatus === "student" ? "Student" : "Alumni"}
                      </span>
                    )}
                    {curProfile.archetype && (
                      <span className="inline-flex items-center rounded-md border border-[#bf5700] px-2.5 py-1 text-xs font-medium text-[#a34800]">
                        {curProfile.archetype === "the_scaler"
                          ? "The Scaler"
                          : curProfile.archetype === "the_steward"
                            ? "The Steward"
                            : "The Architect"}
                      </span>
                    )}
                    <ReportProfileButton
                      reportedUserId={curProfile.user_id ?? ""}
                      reportedName={`${curProfile.firstName ?? ""} ${curProfile.lastName ?? ""}`.trim()}
                    />
                  </div>
                </div>

                {curProfile.isTechnical && (
                  <div className="mb-3 inline-flex items-center rounded-md border border-[#bf5700] px-2.5 py-1 text-xs font-medium text-[#a34800]">
                    {curProfile.isTechnical === "yes" ? "Technical founder" : "Non-technical founder"}
                  </div>
                )}

                {schoolFullName && curProfile.utMajor && (
                  <div className="mb-3 text-xs text-[var(--ui-text-muted)]">
                    {schoolFullName} — {curProfile.utMajor}
                  </div>
                )}

                {curProfile.is_hiring && <HiringBadge />}

                {curProfile.user_id && (
                  <div className="mb-3">
                    <CoFounderLinks userId={curProfile.user_id} onClickCofounder={setViewingUserId} />
                  </div>
                )}

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
                        <span className="rounded-md bg-orange-100 px-2.5 py-1 text-xs text-orange-800 font-medium">{curProfile.startupTimeSpent}</span>
                      )}
                      {curProfile.startupFunding && (
                        <span className="rounded-md bg-orange-100 px-2.5 py-1 text-xs text-orange-800 font-medium">{curProfile.startupFunding}</span>
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
                            className="flex items-center gap-1.5 rounded-full border border-[var(--ui-border)] px-3 py-1.5 text-xs font-medium text-[var(--ui-text-muted)] transition hover:border-[#bf5700] hover:text-[#a34800]"
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
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#BF5700] bg-[#fff6f0] text-[#BF5700] transition hover:bg-[#ffe8d6] cursor-pointer"
                >
                  <MdSkipNext className="h-5 w-5" />
                </button>

                <button
                  onClick={handleLike}
                  disabled={isLikeLoading}
                  className={`flex h-11 px-4 flex-shrink-0 items-center justify-center gap-2 rounded-full transition cursor-pointer font-medium ${
                    likeStatus?.isLiked
                      ? "bg-pink-500 text-white"
                      : "bg-[#BF5700] text-white hover:bg-[#a34800]"
                  }`}
                >
                  <FaPaperPlane className="h-4 w-4" />
                  <span className="text-sm">Send invite</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )
      )}
        </div>
      </div>
    </div>
  );
}
