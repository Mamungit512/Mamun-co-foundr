"use client";

import React from "react";
import Image from "next/image";
import { FaArrowLeft, FaEnvelope, FaUser, FaHandshake } from "react-icons/fa6";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useSession } from "@clerk/nextjs";
import { useMessages } from "@/hooks/useMessages";
import { useConversation } from "@/hooks/useConversations";
import MessageItem from "@/components/MessageItem";
import { Message } from "@/features/messages/messagesService";
import AIWriter from "@/components/ui/AIWriter";
import { trackEvent } from "@/lib/posthog-events";
import ActivityIndicator from "@/components/ActivityIndicator";
import ProfileDetailModal from "@/features/matches/ProfileDetailModal";
import { useProfileByUserId } from "@/features/profile/useProfile";
import { useWeMatch, useWeMatchStatus } from "@/features/matches/useWeMatch";
import { useToggleLike } from "@/features/likes/useLikes";

interface ConversationPageProps {
  params: Promise<{
    slug: string;
    conversationId: string;
  }>;
}

export default function SchoolConversationPage({ params }: ConversationPageProps) {
  const router = useRouter();
  const { session } = useSession();
  const [slug, setSlug] = React.useState<string>("");
  const [conversationId, setConversationId] = React.useState<string>("");
  const [messageInput, setMessageInput] = React.useState<string>("");
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = React.useState<boolean>(false);
  const [showProfile, setShowProfile] = React.useState<boolean>(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
      setConversationId(resolvedParams.conversationId);
    });
  }, [params]);

  const { messages, isLoading, error, sendMessage } =
    useMessages(conversationId);
  const { data: conversation, isLoading: isConversationLoading } =
    useConversation(conversationId);
  const currentUserId = session?.user?.id;

  const otherUserId = conversation?.otherParticipant?.id ?? "";
  const { data: otherProfile } = useProfileByUserId(otherUserId, !!otherUserId);
  const weMatchMutation = useWeMatch();
  const { data: weMatchStatus } = useWeMatchStatus();
  const { toggleLike, isLoading: isUnliking } = useToggleLike();
  const sentSet = new Set(weMatchStatus?.sent ?? []);
  const mutualSet = new Set(weMatchStatus?.mutualNotified ?? []);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || isSending) return;

    setIsSending(true);
    setSendError(null);
    setIsLimitReached(false);

    try {
      await sendMessage(messageInput.trim());

      trackEvent.messageSent(conversationId, {
        message_length: messageInput.trim().length,
        total_messages_in_conversation: messages.length + 1,
      });

      setMessageInput("");
    } catch (error: unknown) {
      console.error("Failed to send message:", error);
      if (typeof window !== "undefined" && window.posthog) {
        window.posthog.captureException(error);
      }

      if (error && typeof error === "object" && "isLimitReached" in error) {
        const limitError = error as Error & {
          isLimitReached: boolean;
          messageCount: number;
          limit: number;
          suggestion: string;
        };
        setIsLimitReached(true);
        setSendError(limitError.message);
      } else {
        const genericError = error as Error;
        setSendError(genericError.message || "Failed to send message");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col min-h-0 max-w-2xl p-4 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center gap-3 border-b border-[var(--ui-border)] pb-4"
      >
        <button
          onClick={() => router.push(`/school/${slug}/matches`)}
          className="flex items-center gap-1.5 rounded-full p-2 text-[var(--ui-text-muted)] transition hover:bg-[var(--ui-surface)] hover:text-[var(--ui-text)] cursor-pointer"
        >
          <FaArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              {isConversationLoading ? (
                <div className="flex h-full w-full items-center justify-center bg-[var(--ui-surface)] text-[var(--ui-text-muted)]">
                  <FaUser className="h-5 w-5" />
                </div>
              ) : conversation?.otherParticipant?.pfp_url ? (
                <Image
                  src={conversation.otherParticipant.pfp_url}
                  alt={`${conversation.otherParticipant.first_name || ""} ${conversation.otherParticipant.last_name || ""}`.trim()}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[var(--ui-surface)] text-[var(--ui-text-muted)]">
                  <FaUser className="h-5 w-5" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[var(--ui-text)]">
                  {isConversationLoading
                    ? "Loading..."
                    : conversation?.otherParticipant
                      ? `${conversation.otherParticipant.first_name || ""} ${conversation.otherParticipant.last_name || ""}`.trim() || "Conversation"
                      : "Conversation"}
                </h1>
                {!isConversationLoading && conversation?.otherParticipant && (
                  <ActivityIndicator
                    lastActiveAt={conversation.otherParticipant.last_active_at}
                    size="sm"
                    showLabel={true}
                  />
                )}
              </div>
              <p className="text-xs text-[var(--ui-text-muted)]">
                {messages.length}/20 messages
              </p>
            </div>
          </div>

          {!isConversationLoading && conversation?.otherParticipant && (
            <div className="flex items-center gap-2">
              {mutualSet.has(otherUserId) ? (
                <span className="flex items-center gap-1.5 rounded-full bg-[var(--org-primary)] px-3 py-1.5 text-xs font-semibold text-white">
                  <FaHandshake className="h-3 w-3" />
                  It&apos;s a Match!
                </span>
              ) : sentSet.has(otherUserId) ? (
                <span className="flex items-center gap-1.5 rounded-full border border-[var(--ui-border)] px-3 py-1.5 text-xs font-medium text-[var(--ui-text-muted)]">
                  <FaHandshake className="h-3 w-3" />
                  Matched ✓
                </span>
              ) : (
                <button
                  onClick={() => weMatchMutation.mutate({ toUserId: otherUserId })}
                  disabled={weMatchMutation.isPending}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--org-primary)] px-3 py-1.5 text-xs font-medium text-[var(--org-primary)] transition hover:bg-[var(--org-primary)] hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  <FaHandshake className="h-3 w-3" />
                  We Match
                </button>
              )}
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-1.5 rounded-full border border-[var(--ui-border)] px-3 py-1.5 text-xs font-medium text-[var(--ui-text-muted)] transition hover:border-[var(--org-primary)] hover:text-[var(--org-primary)] cursor-pointer"
              >
                <FaUser className="h-3 w-3" />
                View Profile
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Notices */}
      <div className="mb-4 space-y-2">
        <div className="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3">
          <p className="text-xs text-[var(--ui-text-muted)]">
            This is a starting point to connect outside of Mamun. Messages are
            not encrypted, so please don&apos;t share sensitive data here.
          </p>
        </div>

        {messages.length >= 20 && (
          <div className="rounded-lg border border-orange-300 bg-orange-50 p-3">
            <p className="text-xs font-medium text-orange-700">
              Message limit reached (20/20). This is a starting point to connect outside of Mamun.
            </p>
          </div>
        )}

        {sendError && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3">
            <p className="text-xs font-medium text-red-700">{sendError}</p>
            {isLimitReached && (
              <p className="mt-1 text-xs text-red-600">
                This is a starting point to connect outside of Mamun.
              </p>
            )}
          </div>
        )}

      </div>

      {/* Messages */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-1 min-h-0 flex-col rounded-xl border border-[var(--ui-border)] bg-white"
        style={{ minHeight: "400px" }}
      >
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--org-primary)] border-t-transparent" />
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <FaEnvelope className="h-8 w-8 text-[var(--ui-text-subtle)]" />
              <p className="text-sm font-medium text-[var(--ui-text)]">
                Error loading messages
              </p>
              <p className="text-xs text-[var(--ui-text-muted)]">{error.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 rounded-lg bg-[var(--org-primary)] px-4 py-2 text-xs font-medium text-white hover:opacity-90 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <FaEnvelope className="h-8 w-8 text-[var(--ui-text-subtle)]" />
              <p className="text-sm font-medium text-[var(--ui-text)]">
                No messages yet
              </p>
              <p className="text-xs text-[var(--ui-text-muted)]">
                Send your first message to start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message: Message) => (
              <MessageItem
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === currentUserId}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[var(--ui-border)] p-3">
          <div className="mb-2">
            <AIWriter
              text={messageInput}
              fieldType="message"
              onAccept={(suggestion) => setMessageInput(suggestion)}
            />
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={
                messages.length >= 20
                  ? "Message limit reached"
                  : "Type a message..."
              }
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--ui-border)] bg-white px-3 py-2 text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] focus:border-[var(--org-primary)] focus:outline-none"
              disabled={isSending || messages.length >= 20}
              maxLength={1000}
            />
            <button
              type="submit"
              className="rounded-lg bg-[var(--org-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40 cursor-pointer"
              disabled={!messageInput.trim() || isSending || messages.length >= 20}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </motion.div>

      <ProfileDetailModal
        profile={showProfile ? (otherProfile ?? null) : null}
        onClose={() => setShowProfile(false)}
        sentSet={sentSet}
        mutualSet={mutualSet}
        onWeMatch={(userId) => weMatchMutation.mutate({ toUserId: userId })}
        onMessage={() => setShowProfile(false)}
        onUnlike={async (userId) => {
          await toggleLike(userId, true);
          setShowProfile(false);
        }}
        isWeMatchPending={weMatchMutation.isPending}
        isMessagePending={false}
        isUnlikePending={isUnliking}
        weMatchPendingId={weMatchMutation.variables?.toUserId}
      />
    </div>
  );
}
