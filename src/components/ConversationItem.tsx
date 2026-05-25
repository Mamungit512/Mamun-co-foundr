"use client";

import { motion } from "motion/react";
import { FaEnvelope } from "react-icons/fa6";
import Image from "next/image";
import { ConversationWithOtherParticipant } from "@/features/conversations/conversationService";
import ActivityIndicator from "@/components/ActivityIndicator";

interface ConversationItemProps {
  conversation: ConversationWithOtherParticipant;
  currentUserId: string;
  onClick: () => void;
}

function ConversationItem({ conversation, onClick }: ConversationItemProps) {
  const { otherParticipant } = conversation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group cursor-pointer rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 transition-all duration-200 hover:border-[var(--ui-border-strong)]"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            {otherParticipant.pfp_url ? (
              <Image
                src={otherParticipant.pfp_url}
                alt={`${otherParticipant.first_name || ""} ${otherParticipant.last_name || ""}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--ui-surface-active)] text-sm font-bold text-[var(--ui-text)]">
                {(otherParticipant.first_name?.[0] ?? "").toUpperCase()}
                {(otherParticipant.last_name?.[0] ?? "").toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -right-0.5 -bottom-0.5">
            <ActivityIndicator
              lastActiveAt={otherParticipant.last_active_at}
              size="sm"
              showLabel={false}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--ui-text)]">
            {otherParticipant.first_name && otherParticipant.last_name
              ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
              : "Unknown User"}
          </p>
          <p className="truncate text-sm text-[var(--ui-text-muted)]">
            {otherParticipant.title || "No title"}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ui-text-subtle)]">
            {new Date(
              conversation.last_message_at || conversation.created_at,
            ).toLocaleDateString()}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ui-surface-active)] text-[var(--ui-text-muted)] transition group-hover:text-[var(--ui-text)]">
          <FaEnvelope className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
}

export default ConversationItem;
