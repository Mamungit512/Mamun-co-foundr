"use client";

import React from "react";
import ReactLenis from "lenis/react";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa6";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useSession } from "@clerk/nextjs";
import { useMessages } from "@/hooks/useMessages";
import MessageItem from "@/components/MessageItem";
import { Message } from "@/features/messages/messagesService";

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

function ConversationPage({ params }: ConversationPageProps) {
  const router = useRouter();
  const { session } = useSession();
  const [conversationId, setConversationId] = React.useState<string>("");

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setConversationId(resolvedParams.conversationId);
    });
  }, [params]);

  const { messages, isLoading, error } = useMessages(conversationId);
  const currentUserId = session?.user?.id;

  return (
    <ReactLenis root>
      <section className="section-padding section-height bg-[var(--charcoal-black)] pt-6 pb-16 text-[var(--mist-white)] sm:pt-8 sm:pb-20">
        <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            className="flex items-center gap-4 border-b border-gray-700 pb-4"
          >
            <button
              onClick={() => router.push("/messages")}
              className="group flex items-center gap-2 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
              title="Back to Messages"
            >
              <FaArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <div className="flex h-full w-full items-center justify-center bg-blue-500/20 text-blue-400">
                  <FaEnvelope className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Conversation</h1>
                <p className="text-sm text-gray-400">
                  Individual conversation view
                </p>
              </div>
            </div>
          </motion.div>

          {/* Messages Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex h-[600px] flex-col rounded-lg border border-gray-700 bg-gray-800/50"
          >
            {/* Messages Container */}
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                    <span className="text-sm">Loading messages...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                      <FaEnvelope className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      Error Loading Messages
                    </h3>
                    <p className="mb-4 text-sm text-red-400">{error.message}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="rounded-lg bg-blue-500/20 px-4 py-2 text-blue-400 transition-colors hover:bg-blue-500/30"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                      <FaEnvelope className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      No Messages Yet
                    </h3>
                    <p className="text-sm text-gray-400">
                      Start the conversation by sending your first message!
                    </p>
                  </div>
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
            </div>

            {/* Message Input Area (Placeholder for future implementation) */}
            <div className="border-t border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    disabled
                  />
                </div>
                <button
                  className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled
                >
                  Send
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-gray-500">
                Message sending will be implemented in a future update
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </ReactLenis>
  );
}

export default ConversationPage;
