"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@clerk/nextjs";
import { FaEnvelope, FaHeart, FaHandshake } from "react-icons/fa6";
import { FaSync } from "react-icons/fa";
import { motion } from "motion/react";
import Image from "next/image";
import ConversationItem from "@/components/ConversationItem";
import { ConversationWithOtherParticipant } from "@/features/conversations/conversationService";
import { useLikedProfilesData, useToggleLike } from "@/features/likes/useLikes";
import { useWeMatch, useWeMatchStatus } from "@/features/matches/useWeMatch";
import ProfileDetailModal from "@/features/matches/ProfileDetailModal";
import { useCreateConversation } from "@/hooks/useConversations";
import { getDegreeAbbreviation } from "@/features/school/data/utSchoolsAndMajors";
import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

type Tab = "messages" | "liked" | "we-match";

export default function SchoolMatchesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useSession();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam === "messages" ? "messages" : "liked"
  );
  useEffect(() => {
    if (tabParam === "messages") {
      setActiveTab("messages");
    }
  }, [tabParam]);
  const [conversations, setConversations] = useState<
    ConversationWithOtherParticipant[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const currentUserId = session?.user?.id;

  const [selectedProfile, setSelectedProfile] = useState<OnboardingData | null>(null);

  const { data: likedProfilesData, isLoading: isLikedLoading } =
    useLikedProfilesData();
  const { toggleLike, isLoading: isUnliking } = useToggleLike();
  const createConversationMutation = useCreateConversation();
  const weMatchMutation = useWeMatch();
  const { data: weMatchStatus } = useWeMatchStatus();
  const sentSet = new Set(weMatchStatus?.sent ?? []);
  const mutualSet = new Set(weMatchStatus?.mutualNotified ?? []);

  const likedProfiles = likedProfilesData?.profiles ?? [];

  const fetchConversations = useCallback(async () => {
    if (!session) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await session.getToken();
      if (!token) throw new Error("No authentication token");

      const response = await fetch("/api/conversations", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch conversations");

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleConversationClick = async (conversationId: string) => {
    const resolvedParams = await params;
    router.push(`/school/${resolvedParams.slug}/matches/${conversationId}`);
  };

  const handleMessage = async (otherUserId: string) => {
    const resolvedParams = await params;
    try {
      const result = await createConversationMutation.mutateAsync({
        otherUserId,
      });
      if (result?.conversation?.id) {
        router.push(
          `/school/${resolvedParams.slug}/matches/${result.conversation.id}`,
        );
      }
    } catch {
      toast.error("Failed to start conversation");
    }
  };

  const handleUnlike = async (userId: string) => {
    try {
      await toggleLike(userId, true);
    } catch {
      toast.error("Failed to remove like");
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "liked",
      label: "Liked",
      icon: <FaHeart className="h-4 w-4" />,
      count: likedProfiles.length,
    },
    {
      id: "messages",
      label: "Messages",
      icon: <FaEnvelope className="h-4 w-4" />,
      count: conversations.length,
    },
    {
      id: "we-match",
      label: "We Match",
      icon: <FaHandshake className="h-4 w-4" />,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl p-4 pt-6">
      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition cursor-pointer ${
              activeTab === tab.id
                ? "bg-[var(--org-primary)] text-white shadow-sm"
                : "text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]"
            }`}
          >
            {tab.icon}
            {tab.label}
            {(tab.count ?? 0) > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-[var(--ui-surface-active)] text-[var(--ui-text-muted)]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages tab */}
      {activeTab === "messages" && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <FaSync className="h-6 w-6 animate-spin text-[var(--ui-text-muted)]" />
            </div>
          ) : error ? (
            <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              Failed to load conversations. Please refresh.
            </p>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FaEnvelope className="h-10 w-10 text-[var(--ui-text-subtle)]" />
              <p className="font-medium text-[var(--ui-text-muted)]">
                No conversations yet
              </p>
              <p className="text-sm text-[var(--ui-text-subtle)]">
                Message someone from their profile card to start chatting.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {conversations.map((convo) => (
                <ConversationItem
                  key={convo.id}
                  conversation={convo}
                  currentUserId={currentUserId || ""}
                  onClick={() => handleConversationClick(convo.id)}
                />
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* Liked tab */}
      {activeTab === "liked" && (
        <>
          {isLikedLoading ? (
            <div className="flex items-center justify-center py-16">
              <FaSync className="h-6 w-6 animate-spin text-[var(--ui-text-muted)]" />
            </div>
          ) : likedProfiles.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FaHeart className="h-10 w-10 text-[var(--ui-text-subtle)]" />
              <p className="font-medium text-[var(--ui-text-muted)]">
                No liked profiles yet
              </p>
              <p className="text-sm text-[var(--ui-text-subtle)]">
                Like someone from the dashboard and they&apos;ll appear
                here.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {likedProfiles.map((profile) => {
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

                return (
                  <div
                    key={profile.user_id}
                    className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar + name — clickable to open full profile */}
                      <button
                        onClick={() => setSelectedProfile(profile)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer"
                      >
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

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[var(--ui-text)]">
                            {profile.firstName} {profile.lastName}
                          </p>
                          {degreeAbbrev && yearSuffix ? (
                            <p className="text-sm text-[var(--ui-text-muted)]">
                              {degreeAbbrev} {yearSuffix}
                            </p>
                          ) : profile.title ? (
                            <p className="truncate text-sm text-[var(--ui-text-muted)]">
                              {profile.title}
                            </p>
                          ) : null}
                        </div>
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* We Match button */}
                        {profile.user_id && mutualSet.has(profile.user_id) ? (
                          <button
                            onClick={() => profile.user_id && handleMessage(profile.user_id)}
                            disabled={createConversationMutation.isPending}
                            className="flex items-center gap-1.5 rounded-full bg-[var(--org-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
                          >
                            <FaHandshake className="h-3.5 w-3.5" />
                            It&apos;s a Match!
                          </button>
                        ) : profile.user_id && sentSet.has(profile.user_id) ? (
                          <button
                            disabled
                            className="flex items-center gap-1.5 rounded-full bg-[var(--ui-surface-active)] px-4 py-2 text-xs font-medium text-[var(--ui-text-muted)] cursor-not-allowed"
                          >
                            <FaHandshake className="h-3.5 w-3.5" />
                            Matched ✓
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              profile.user_id &&
                              weMatchMutation.mutate({ toUserId: profile.user_id })
                            }
                            disabled={
                              weMatchMutation.isPending &&
                              weMatchMutation.variables?.toUserId === profile.user_id
                            }
                            className="flex items-center gap-1.5 rounded-full border border-[var(--org-primary)] px-4 py-2 text-xs font-medium text-[var(--org-primary)] transition hover:bg-[var(--org-primary)] hover:text-white disabled:opacity-50 cursor-pointer"
                          >
                            <FaHandshake className="h-3.5 w-3.5" />
                            We Match
                          </button>
                        )}

                        <button
                          onClick={() =>
                            profile.user_id && handleMessage(profile.user_id)
                          }
                          disabled={createConversationMutation.isPending}
                          className="rounded-full bg-[var(--org-primary)] px-4 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
                        >
                          Message
                        </button>
                        <button
                          onClick={() =>
                            profile.user_id && handleUnlike(profile.user_id)
                          }
                          disabled={isUnliking}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500 text-white transition hover:bg-pink-600 disabled:opacity-50 cursor-pointer"
                          title="Remove like"
                        >
                          <FaHeart className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </>
      )}
      {/* We Match info tab */}
      {activeTab === "we-match" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--ui-border)] bg-[var(--ui-surface-active)]">
              <FaHandshake className="h-6 w-6 text-[var(--org-primary)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--ui-text)]">
              How We Match Works
            </h2>
            <p className="mt-1 text-sm text-[var(--ui-text-muted)]">
              A mutual signal. Stronger than a like, lighter than a message.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {[
              {
                step: 1,
                title: "You click We Match",
                body: "Tapping We Match on someone's profile records your intent. They don't see a notification yet. It's one-sided until they reciprocate.",
              },
              {
                step: 2,
                title: "They click We Match back",
                body: "If they visit your profile and click We Match too, the app detects the mutual intent instantly.",
              },
              {
                step: 3,
                title: "It's a Match. You both get an email.",
                body: "Once mutual, both of you receive an email with each other's profile highlights and a direct link to start a conversation outside Mamun.",
              },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="flex gap-4 rounded-xl border border-[var(--ui-border)] p-4"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--org-primary)] text-sm font-bold text-white">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-[var(--ui-text)]">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-[var(--ui-text-muted)]">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Permanent action notice */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-800">
              We Match is permanent
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
              Once sent, it can&apos;t be retracted. Only click We Match when
              you genuinely want to work with someone.
            </p>
          </div>

          {/* Footer note */}
          <p className="rounded-lg border border-[var(--ui-border)] p-3 text-xs leading-relaxed text-[var(--ui-text-muted)]">
            We Match is separate from messaging. Use it as a stronger signal
            that you want to work together. The email gives you both
            everything you need to connect directly.
          </p>
        </motion.div>
      )}

      <ProfileDetailModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        sentSet={sentSet}
        mutualSet={mutualSet}
        onWeMatch={(userId) => weMatchMutation.mutate({ toUserId: userId })}
        onMessage={handleMessage}
        onUnlike={async (userId) => {
          await handleUnlike(userId);
          setSelectedProfile(null);
        }}
        isWeMatchPending={weMatchMutation.isPending}
        isMessagePending={createConversationMutation.isPending}
        isUnlikePending={isUnliking}
        weMatchPendingId={weMatchMutation.variables?.toUserId}
      />
    </div>
  );
}
