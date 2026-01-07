import React from "react";
import { motion } from "motion/react";
import { FaUser } from "react-icons/fa6";
import { Message } from "@/features/messages/messagesService";
import Image from "next/image";

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

function MessageItem({ message, isOwnMessage }: MessageItemProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`flex max-w-[70%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"} items-center gap-2`}
      >
        {/* Avatar */}
        {!isOwnMessage && (
          <div className="flex-shrink-0">
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              {message.sender.pfp_url ? (
                <Image
                  src={message.sender.pfp_url}
                  alt={`${message.sender.first_name} ${message.sender.last_name}`}
                  className="object-cover"
                  fill
                  sizes="32px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-500/20 text-blue-400">
                  <FaUser className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
        >
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
            }`}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>

          {/* Timestamp */}
          <div
            className={`mt-1 text-xs text-gray-400 ${isOwnMessage ? "text-right" : "text-left"}`}
          >
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MessageItem;
