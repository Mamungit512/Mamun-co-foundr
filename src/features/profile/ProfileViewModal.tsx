"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe,
  FaCalendar,
  FaPaperPlane,
  FaArrowLeft,
} from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import HiringBadge from "@/components/HiringBadge";
import CoFounderLinks from "@/features/cofounder/CoFounderLinks";
import {
  getDegreeAbbreviation,
  getSchoolFullName,
  SECTOR_INTEREST_LABELS,
} from "@/features/school/data/utSchoolsAndMajors";
import { useProfileByUserId } from "./useProfile";
import { useToggleLike, useLikeStatus } from "@/features/likes/useLikes";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import ReportProfileButton from "@/features/report/ReportProfileButton";

interface ProfileViewModalProps {
  /** Pass a full profile when you already have the data (avoids an extra fetch). */
  profile?: OnboardingData | null;
  /** Pass only a userId when you don't have the profile object yet (modal fetches it). */
  userId?: string | null;
  onClose: () => void;
}

export default function ProfileViewModal({ profile: profileProp, userId, onClose }: ProfileViewModalProps) {
  // Internal navigation: when user clicks a linked cofounder, we navigate to their profile.
  // navUserId overrides the props while set; clearing it returns to the root profile.
  const [navUserId, setNavUserId] = useState<string | null>(null);

  // Reset internal nav whenever the root target changes (modal opened for a new person)
  const rootId = profileProp?.user_id ?? userId ?? null;
  useEffect(() => { setNavUserId(null); }, [rootId]);

  const targetId = navUserId ?? rootId;
  const isNavigated = !!navUserId;

  // Only fetch when we don't have the profile directly (or we've navigated away)
  const shouldFetch = isNavigated || (!profileProp && !!targetId);
  const { data: fetchedProfile, isLoading } = useProfileByUserId(targetId ?? "", shouldFetch && !!targetId);
  const profile = isNavigated ? (fetchedProfile ?? null) : (profileProp ?? fetchedProfile ?? null);

  const { toggleLike, isLoading: isLikeLoading } = useToggleLike();
  const { data: likeStatus } = useLikeStatus(targetId ?? "");
  const queryClient = useQueryClient();

  const handleInvite = async () => {
    if (!targetId || isLikeLoading) return;
    try {
      await toggleLike(targetId, likeStatus?.isLiked ?? false);
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profiles-search"] });
    } catch {
      toast.error("Failed to send invite");
    }
  };

  if (!targetId) return null;

  const initials = profile
    ? (profile.firstName?.[0] ?? "").toUpperCase() + (profile.lastName?.[0] ?? "").toUpperCase()
    : "";

  const degreeAbbrev =
    profile?.utCollege && profile?.utMajor
      ? getDegreeAbbreviation(profile.utCollege, profile.utMajor)
      : undefined;

  const yearSuffix = profile?.gradYear
    ? `'${String(profile.gradYear).slice(-2)}`
    : undefined;

  const schoolFullName = profile?.utCollege
    ? getSchoolFullName(profile.utCollege)
    : undefined;

  const isOnline = profile?.last_active_at
    ? new Date().getTime() - new Date(profile.last_active_at).getTime() < 5 * 60 * 1000
    : false;

  const socialLinks = profile
    ? [
        profile.linkedin && { href: profile.linkedin, icon: <FaLinkedin className="h-4 w-4" />, label: "LinkedIn" },
        profile.twitter && { href: profile.twitter, icon: <FaTwitter className="h-4 w-4" />, label: "Twitter / X" },
        profile.git && { href: profile.git, icon: <FaGithub className="h-4 w-4" />, label: "GitHub" },
        profile.personalWebsite && { href: profile.personalWebsite, icon: <FaGlobe className="h-4 w-4" />, label: "Website" },
        profile.schedulingUrl && { href: profile.schedulingUrl, icon: <FaCalendar className="h-4 w-4" />, label: "Schedule a call" },
      ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[]
    : [];

  const showLoading = isLoading && shouldFetch;

  return (
    <AnimatePresence>
      {targetId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-[var(--ui-border)] bg-[var(--ui-popover-bg)] shadow-2xl sm:rounded-2xl sm:h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky header */}
            <div className="flex-shrink-0 border-b border-[var(--ui-border)] p-5">
              {showLoading ? (
                <div className="flex items-center gap-4">
                  <div className="h-[72px] w-[72px] flex-shrink-0 animate-pulse rounded-full bg-[var(--ui-surface-active)]" />
                  <div className="flex flex-col gap-2">
                    <div className="h-5 w-40 animate-pulse rounded-md bg-[var(--ui-surface-active)]" />
                    <div className="h-4 w-28 animate-pulse rounded-md bg-[var(--ui-surface-active)]" />
                  </div>
                </div>
              ) : profile ? (
                <div className="flex items-start gap-4">
                  {/* Back button when navigated into a cofounder */}
                  {isNavigated && (
                    <button
                      onClick={() => setNavUserId(null)}
                      className="mt-1 flex-shrink-0 rounded-full p-2 text-[var(--ui-text-muted)] transition hover:bg-[var(--ui-surface-active)] hover:text-[var(--ui-text)] cursor-pointer"
                      title="Back"
                    >
                      <FaArrowLeft className="h-4 w-4" />
                    </button>
                  )}

                  <div className="relative flex-shrink-0">
                    {profile.pfp_url ? (
                      <Image
                        src={profile.pfp_url}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        width={72}
                        height={72}
                        className="h-[72px] w-[72px] rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700">
                        {initials}
                      </div>
                    )}
                    <div
                      className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-300"}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-[var(--ui-text)]">
                        {profile.firstName} {profile.lastName}
                      </h2>
                      {profile.isHiring && (
                        <HiringBadge
                          hiringEmail={profile.hiringEmail}
                          companyName={profile.startupName}
                          className="px-2 py-0.5 text-xs"
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {profile.utStatus && (
                        <span className="inline-flex items-center rounded-md border border-[var(--ui-border-strong)] px-2 py-0.5 text-xs font-medium text-[var(--ui-text-muted)]">
                          {profile.utStatus === "student" ? "Student" : "Alumni"}
                        </span>
                      )}
                      {profile.archetype && (
                        <span className="inline-flex items-center rounded-md border border-[var(--org-primary)] px-2 py-0.5 text-xs font-medium text-[var(--org-primary)]">
                          {profile.archetype === "the_scaler"
                            ? "The Scaler"
                            : profile.archetype === "the_steward"
                              ? "The Steward"
                              : "The Architect"}
                        </span>
                      )}
                      {profile.isTechnical && (
                        <span className="inline-flex items-center rounded-md border border-[var(--org-primary)] px-2 py-0.5 text-xs font-medium text-[var(--org-primary)]">
                          {profile.isTechnical === "yes" ? "Technical founder" : "Non-technical founder"}
                        </span>
                      )}
                    </div>

                    {(degreeAbbrev || schoolFullName) && (
                      <p className="mt-1.5 text-xs text-[var(--ui-text-muted)]">
                        {degreeAbbrev && yearSuffix ? `${degreeAbbrev} ${yearSuffix}` : degreeAbbrev ?? ""}
                        {schoolFullName && profile.utMajor ? ` · ${schoolFullName} — ${profile.utMajor}` : ""}
                      </p>
                    )}

                    {targetId && (
                      <div className="mt-2">
                        <CoFounderLinks userId={targetId} onClickCofounder={setNavUserId} />
                      </div>
                    )}
                  </div>

                  <ReportProfileButton
                    reportedUserId={targetId}
                    reportedName={`${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()}
                  />
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>

            {/* Scrollable body */}
            {profile && (
              <div className="flex-1 overflow-y-auto p-5">
                <div className="space-y-5">
                  {profile.personalIntro && (
                    <Section title="About">
                      <p className="text-sm leading-relaxed text-[var(--ui-text)]">
                        {profile.personalIntro}
                      </p>
                    </Section>
                  )}

                  {profile.utSectorInterests && profile.utSectorInterests.length > 0 && (
                    <Section title="Sector Interests">
                      <div className="flex flex-wrap gap-1.5">
                        {profile.utSectorInterests.map((interest: string, i: number) => (
                          <span
                            key={interest}
                            className="rounded-md px-2.5 py-1 text-xs font-medium"
                            style={
                              i < 2
                                ? { backgroundColor: "var(--org-primary)", color: "#fff" }
                                : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                            }
                          >
                            {SECTOR_INTEREST_LABELS[interest as keyof typeof SECTOR_INTEREST_LABELS] || interest}
                          </span>
                        ))}
                      </div>
                    </Section>
                  )}

                  {profile.education && (
                    <Section title="Education">
                      <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ui-text)]">
                        {profile.education}
                      </p>
                    </Section>
                  )}

                  {profile.experience && (
                    <Section title="Experience">
                      <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ui-text)]">
                        {profile.experience}
                      </p>
                    </Section>
                  )}

                  {profile.accomplishments && (
                    <Section title="Accomplishments">
                      <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ui-text)]">
                        {profile.accomplishments}
                      </p>
                    </Section>
                  )}

                  {profile.hasStartup === "yes" && profile.startupName && (
                    <Section title="Startup">
                      <p className="mb-1 font-medium text-[var(--ui-text)]">{profile.startupName}</p>
                      {profile.startupDescription && (
                        <p className="text-sm leading-relaxed text-[var(--ui-text-muted)]">
                          {profile.startupDescription}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile.startupTimeSpent && (
                          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                            {profile.startupTimeSpent}
                          </span>
                        )}
                        {profile.startupFunding && (
                          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                            {profile.startupFunding}
                          </span>
                        )}
                      </div>
                    </Section>
                  )}

                  {socialLinks.length > 0 && (
                    <Section title="Connect">
                      <div className="flex flex-wrap gap-2">
                        {socialLinks.map(({ href, icon, label }) => (
                          <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-full border border-[var(--ui-border)] px-3 py-1.5 text-xs font-medium text-[var(--ui-text-muted)] transition hover:border-[var(--org-primary)] hover:text-[var(--org-primary)]"
                          >
                            {icon}
                            {label}
                          </a>
                        ))}
                      </div>
                    </Section>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            {profile && (
              <div className="flex-shrink-0 border-t border-[var(--ui-border)] p-4">
                <button
                  onClick={handleInvite}
                  disabled={isLikeLoading}
                  className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 cursor-pointer ${
                    likeStatus?.isLiked
                      ? "bg-pink-500 text-white hover:bg-pink-600"
                      : "bg-[var(--org-primary)] text-white hover:opacity-90"
                  }`}
                >
                  <FaPaperPlane className="h-4 w-4" />
                  {likeStatus?.isLiked ? "Invited ✓" : "Send Invite"}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
        {title}
      </p>
      {children}
    </div>
  );
}
