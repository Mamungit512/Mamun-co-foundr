"use client";

import { motion } from "motion/react";
import { FaEnvelope, FaUser } from "react-icons/fa6";
import Image from "next/image";
import { ConversationWithOtherParticipant } from "@/features/conversations/conversationService";

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
      className="group cursor-pointer rounded-lg border border-gray-700 bg-gray-800/50 p-4 transition-all duration-200 hover:border-blue-500/50 hover:bg-gray-800"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-full">
          {otherParticipant.pfp_url ? (
            <Image
              src={otherParticipant.pfp_url}
              alt={`${otherParticipant.first_name || ""} ${otherParticipant.last_name || ""}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue-500/20 text-blue-400">
              <FaUser className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-white">
            {otherParticipant.first_name && otherParticipant.last_name
              ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
              : "Unknown User"}
          </h4>
          <p className="text-sm text-gray-400">
            {otherParticipant.title || "No title"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(
              conversation.last_message_at || conversation.created_at,
            ).toLocaleDateString()}
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 transition-all duration-200 group-hover:bg-blue-500/30">
          <FaEnvelope className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
}

export default ConversationItem;
