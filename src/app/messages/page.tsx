"use client";

import ReactLenis from "lenis/react";
import { FaEnvelope, FaHeart } from "react-icons/fa6";
import { FaSync } from "react-icons/fa";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useSession } from "@clerk/nextjs";
import ConversationItem from "@/components/ConversationItem";
import { ConversationWithOtherParticipant } from "@/features/conversations/conversationService";
import { useState, useEffect, useCallback } from "react";

function MessagesPage() {
  const router = useRouter();
  const { session } = useSession();
  const [conversations, setConversations] = useState<
    ConversationWithOtherParticipant[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const currentUserId = session?.user?.id;

  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    if (!session) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await session.getToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch("/api/conversations", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("MessagesPage: Error fetching conversations:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  return (
    <ReactLenis root>
      <section className="section-padding section-height bg-[var(--charcoal-black)] pt-6 pb-16 text-[var(--mist-white)] sm:pt-8 sm:pb-20">
        <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
                Messages to Connections
              </h2>
              <p className="text-sm text-white/70 sm:text-base md:text-lg">
                Connect with your matched cofounders
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchConversations}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-blue-500/20 px-4 py-2 text-blue-400 transition-all duration-200 hover:bg-blue-500/30 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSync
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium">Refresh</span>
            </motion.button>
          </motion.div>

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex min-h-[400px] flex-col items-center justify-center space-y-6"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
              <span className="text-gray-300">Loading conversations...</span>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex min-h-[400px] flex-col items-center justify-center space-y-6"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <FaEnvelope className="h-8 w-8" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-semibold text-white">
                  Error loading conversations
                </h3>
                <p className="max-w-md text-sm text-white/70">
                  {error.message || "Something went wrong. Please try again."}
                </p>
              </div>
            </motion.div>
          ) : conversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex min-h-[400px] flex-col items-center justify-center space-y-6"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                <FaEnvelope className="h-8 w-8" />
              </div>

              <div className="space-y-2 text-center">
                <h3 className="text-xl font-semibold text-white">
                  No messages yet
                </h3>
                <p className="max-w-md text-sm text-white/70">
                  Start connecting with your matches by liking profiles in the
                  cofounder matching section. When you both like each other, you
                  can start messaging!
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-2 rounded-lg bg-pink-500/20 px-6 py-3 text-pink-400 transition-all duration-200 hover:bg-pink-500/30 hover:text-pink-300"
                onClick={() => router.push("/cofoundr-matching")}
              >
                <FaHeart className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">Start Matching</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white">
                Your Conversations
              </h3>
              <div className="space-y-3">
                {conversations.map(
                  (conversation: ConversationWithOtherParticipant) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      currentUserId={currentUserId || ""}
                      onClick={() =>
                        router.push(`/messages/${conversation.id}`)
                      }
                    />
                  ),
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </ReactLenis>
  );
}

export default MessagesPage;
