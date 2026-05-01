"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@clerk/nextjs";
import { FaEnvelope, FaHeart } from "react-icons/fa6";
import { FaSync } from "react-icons/fa";
import { motion } from "motion/react";
import ConversationItem from "@/components/ConversationItem";
import { ConversationWithOtherParticipant } from "@/features/conversations/conversationService";
import { useState, useEffect, useCallback } from "react";

export default function SchoolMatchesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { session } = useSession();
  const [conversations, setConversations] = useState<
    ConversationWithOtherParticipant[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const currentUserId = session?.user?.id;

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

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <FaSync className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 pt-6">
      <div className="mb-6 flex items-center gap-2">
        <FaEnvelope className="h-5 w-5 text-white/60" />
        <h1 className="text-xl font-semibold text-(--mist-white)">Messages</h1>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          Failed to load conversations. Please refresh.
        </p>
      )}

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FaHeart className="h-10 w-10 text-white/10" />
          <p className="font-medium text-white/40">No conversations yet</p>
          <p className="text-sm text-white/25">
            Like a co-founder to start a conversation.
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
              key={convo.conversation_id}
              conversation={convo}
              currentUserId={currentUserId || ""}
              onClick={() => handleConversationClick(convo.conversation_id)}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
