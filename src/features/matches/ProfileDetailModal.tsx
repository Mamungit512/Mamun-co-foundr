"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  FaHeart,
  FaHandshake,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe,
  FaCalendar,
  FaEnvelope,
} from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import HiringBadge from "@/components/HiringBadge";
import CoFounderLinks from "@/features/cofounder/CoFounderLinks";
import ProfileViewModal from "@/features/profile/ProfileViewModal";
import {
  getDegreeAbbreviation,
  getSchoolFullName,
  SECTOR_INTEREST_LABELS,
} from "@/features/school/data/utSchoolsAndMajors";

interface ProfileDetailModalProps {
  profile: OnboardingData | null;
  onClose: () => void;
  sentSet: Set<string>;
  mutualSet: Set<string>;
  onWeMatch: (userId: string) => void;
  onMessage: (userId: string) => void;
  onUnlike: (userId: string) => void;
  isWeMatchPending: boolean;
  isMessagePending: boolean;
  isUnlikePending: boolean;
  weMatchPendingId?: string;
}

export default function ProfileDetailModal({
  profile,
  onClose,
  sentSet,
  mutualSet,
  onWeMatch,
  onMessage,
  onUnlike,
  isWeMatchPending,
  isMessagePending,
  isUnlikePending,
  weMatchPendingId,
}: ProfileDetailModalProps) {
  const [viewingCofounderUserId, setViewingCofounderUserId] = useState<string | null>(null);

  if (!profile) return null;

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

  const schoolFullName = profile.utCollege
    ? getSchoolFullName(profile.utCollege)
    : undefined;

  const isOnline = profile.last_active_at
    ? new Date().getTime() - new Date(profile.last_active_at).getTime() <
      5 * 60 * 1000
    : false;

  const userId = profile.user_id ?? "";
  const isMutual = mutualSet.has(userId);
  const isSent = sentSet.has(userId);

  const socialLinks = [
    profile.linkedin && {
      href: profile.linkedin,
      icon: <FaLinkedin className="h-4 w-4" />,
      label: "LinkedIn",
    },
    profile.twitter && {
      href: profile.twitter,
      icon: <FaTwitter className="h-4 w-4" />,
      label: "Twitter / X",
    },
    profile.git && {
      href: profile.git,
      icon: <FaGithub className="h-4 w-4" />,
      label: "GitHub",
    },
    profile.personalWebsite && {
      href: profile.personalWebsite,
      icon: <FaGlobe className="h-4 w-4" />,
      label: "Website",
    },
    profile.schedulingUrl && {
      href: profile.schedulingUrl,
      icon: <FaCalendar className="h-4 w-4" />,
      label: "Schedule a call",
    },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[];

  return (
    <>
    <AnimatePresence>
      {profile && (
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
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {profile.pfp_url ? (
                    <Image
                      src={profile.pfp_url}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      width={72}
                      height={72}
                      className="h-18 w-18 rounded-full object-cover"
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

                {/* Name + badges */}
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
                        {profile.isTechnical === "yes"
                          ? "Technical founder"
                          : "Non-technical founder"}
                      </span>
                    )}
                  </div>

                  {(degreeAbbrev || schoolFullName) && (
                    <p className="mt-1.5 text-xs text-[var(--ui-text-muted)]">
                      {degreeAbbrev && yearSuffix
                        ? `${degreeAbbrev} ${yearSuffix}`
                        : degreeAbbrev ?? ""}
                      {schoolFullName && profile.utMajor
                        ? ` · ${schoolFullName} — ${profile.utMajor}`
                        : ""}
                    </p>
                  )}
                  {userId && (
                    <div className="mt-2">
                      <CoFounderLinks userId={userId} onClickCofounder={setViewingCofounderUserId} />
                    </div>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-5">
                {/* About */}
                {profile.personalIntro && (
                  <Section title="About">
                    <p className="text-sm leading-relaxed text-[var(--ui-text)]">
                      {profile.personalIntro}
                    </p>
                  </Section>
                )}

                {/* Sector interests */}
                {profile.utSectorInterests &&
                  profile.utSectorInterests.length > 0 && (
                    <Section title="Sector Interests">
                      <div className="flex flex-wrap gap-1.5">
                        {profile.utSectorInterests.map(
                          (interest: string, i: number) => (
                            <span
                              key={interest}
                              className="rounded-md px-2.5 py-1 text-xs font-medium"
                              style={
                                i < 2
                                  ? {
                                      backgroundColor: "var(--org-primary)",
                                      color: "#fff",
                                    }
                                  : {
                                      backgroundColor: "#f3f4f6",
                                      color: "#6b7280",
                                    }
                              }
                            >
                              {SECTOR_INTEREST_LABELS[
                                interest as keyof typeof SECTOR_INTEREST_LABELS
                              ] || interest}
                            </span>
                          ),
                        )}
                      </div>
                    </Section>
                  )}

                {/* Education */}
                {profile.education && (
                  <Section title="Education">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ui-text)]">
                      {profile.education}
                    </p>
                  </Section>
                )}

                {/* Experience */}
                {profile.experience && (
                  <Section title="Experience">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ui-text)]">
                      {profile.experience}
                    </p>
                  </Section>
                )}

                {/* Accomplishments */}
                {profile.accomplishments && (
                  <Section title="Accomplishments">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ui-text)]">
                      {profile.accomplishments}
                    </p>
                  </Section>
                )}

                {/* Startup */}
                {profile.hasStartup === "yes" && profile.startupName && (
                  <Section title="Startup">
                    <p className="mb-1 font-medium text-[var(--ui-text)]">
                      {profile.startupName}
                    </p>
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

                {/* Connect */}
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

            {/* Sticky footer actions */}
            <div className="flex-shrink-0 border-t border-[var(--ui-border)] p-4">
              <div className="flex items-center gap-2">
                {/* We Match */}
                {isMutual ? (
                  <button
                    onClick={() => onMessage(userId)}
                    disabled={isMessagePending}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--org-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    <FaHandshake className="h-4 w-4" />
                    It&apos;s a Match!
                  </button>
                ) : isSent ? (
                  <button
                    disabled
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
                  >
                    <FaHandshake className="h-4 w-4" />
                    Matched ✓
                  </button>
                ) : (
                  <button
                    onClick={() => onWeMatch(userId)}
                    disabled={isWeMatchPending && weMatchPendingId === userId}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--org-primary)] px-4 py-2.5 text-sm font-medium text-[var(--org-primary)] transition hover:bg-[var(--org-primary)] hover:text-white disabled:opacity-50 cursor-pointer"
                  >
                    <FaHandshake className="h-4 w-4" />
                    We Match
                  </button>
                )}

                {/* Message */}
                <button
                  onClick={() => onMessage(userId)}
                  disabled={isMessagePending}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--org-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  <FaEnvelope className="h-4 w-4" />
                  Message
                </button>

                {/* Unlike */}
                <button
                  onClick={() => onUnlike(userId)}
                  disabled={isUnlikePending}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-white transition hover:bg-pink-600 disabled:opacity-50 cursor-pointer"
                  title="Remove like"
                >
                  <FaHeart className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    <ProfileViewModal
      userId={viewingCofounderUserId}
      onClose={() => setViewingCofounderUserId(null)}
    />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
        {title}
      </p>
      {children}
    </div>
  );
}
