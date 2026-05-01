"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiSparkles } from "react-icons/hi2";
import { FaTimes } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { FaCrown } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

import { useAISearch, useAISearchAccess } from "@/features/matching/useAISearch";
import { useToggleLike } from "@/features/likes/useLikes";
import { useCreateConversation } from "@/hooks/useConversations";
import AISearchResultCard from "./AISearchResultCard";

export default function AISearchBar() {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [messageLoadingId, setMessageLoadingId] = useState<string | null>(null);
  const hasAccess = useAISearchAccess();
  const { mutate: search, data, isPending, reset } = useAISearch();
  const { toggleLike, isLoading: isLikeLoading } = useToggleLike();
  const createConversationMutation = useCreateConversation();
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim().length < 3) return;
    search(query.trim(), {
      onSuccess: () => setShowResults(true),
      onError: (error) => {
        toast.error(error.message || "AI search failed. Please try again.", {
          duration: 3000,
          position: "bottom-right",
        });
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isPending) {
      handleSearch();
    }
  };

  const handleClose = () => {
    setShowResults(false);
    reset();
  };

  const handleLike = async (userId: string) => {
    try {
      await toggleLike(userId, false);
      toast.success("Liked!", { duration: 2000, position: "bottom-right" });
    } catch {
      toast.error("Failed to like profile.", {
        duration: 3000,
        position: "bottom-right",
      });
    }
  };

  const handleMessage = async (userId: string) => {
    setMessageLoadingId(userId);
    try {
      const result = await createConversationMutation.mutateAsync({
        otherUserId: userId,
      });
      if (result.success) {
        router.push(`/messages/${result.conversation.id}`);
      }
    } catch {
      toast.error("Failed to start conversation.", {
        duration: 3000,
        position: "bottom-right",
      });
    } finally {
      setMessageLoadingId(null);
    }
  };

  if (!hasAccess) {
    return (
      <div className="mb-6 rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-300/10">
              <HiSparkles className="h-5 w-5 text-yellow-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">
                AI-Powered Search
              </p>
              <p className="text-xs text-gray-500">
                Find your ideal co-founder with natural language
              </p>
            </div>
          </div>
          <Link
            href="/billing/upgrade"
            className="flex items-center gap-2 rounded-lg bg-yellow-300/10 px-4 py-2 text-sm font-medium text-yellow-300 transition-colors hover:bg-yellow-300/20"
          >
            <FaCrown className="h-4 w-4" />
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-300/10">
            <HiSparkles className="h-5 w-5 text-yellow-300" />
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search with AI... e.g. 'AI engineer in Berlin'"
              className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 py-2.5 pr-4 pl-10 text-sm text-white placeholder-gray-500 transition-colors focus:border-yellow-300/50 focus:outline-none"
              disabled={isPending}
            />
            <IoSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
          <motion.button
            onClick={handleSearch}
            disabled={isPending || query.trim().length < 3}
            className="shrink-0 rounded-lg bg-yellow-300/10 px-4 py-2.5 text-sm font-medium text-yellow-300 transition-colors hover:bg-yellow-300/20 disabled:opacity-40 disabled:hover:bg-yellow-300/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-300 border-t-transparent" />
                Searching...
              </div>
            ) : (
              "Search"
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showResults && data && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
          >
            <motion.div
              className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between border-b border-gray-700/50 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <HiSparkles className="h-5 w-5 text-yellow-300" />
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      AI Search Results
                    </h2>
                    <p className="text-sm text-gray-400">
                      &ldquo;{data.query}&rdquo;
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes className="h-4 w-4" />
                </motion.button>
              </div>

              <div className="overflow-y-auto p-4 sm:p-5" style={{ maxHeight: "calc(85vh - 80px)" }}>
                {data.results.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
                      <IoSearch className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400">
                      No matching profiles found. Try a different search.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.results.map((profile, index) => (
                      <motion.div
                        key={profile.user_id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <AISearchResultCard
                          profile={profile}
                          onLike={handleLike}
                          onMessage={handleMessage}
                          isLikeLoading={isLikeLoading}
                          isMessageLoading={messageLoadingId === profile.user_id}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
