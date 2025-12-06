
// src/components/ui/AIWriter.tsx

"use client";

import React, { useState, useEffect } from "react";
import { FaWandMagicSparkles, FaCheck, FaXmark } from "react-icons/fa6";
import { motion, AnimatePresence } from "motion/react";

interface AIWriterProps {
  text: string;
  onAccept: (suggestion: string) => void;
  fieldType?: string;
  placeholder?: string;
}

export default function AIWriter({
  text,
  onAccept,
  fieldType,
  placeholder = "Start typing to get AI suggestions...",
}: AIWriterProps) {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState("");

  // Check if user has typed 2+ words with 3+ characters
  useEffect(() => {
    const words = text.trim().split(/\s+/).filter((word) => word.length >= 3);
    console.log("AIWriter Debug:", { text, words, wordCount: words.length });
    if (words.length >= 2 && !showSuggestion && !aiSuggestion) {
      console.log("AIWriter: Showing suggestion panel");
      setShowSuggestion(true);
    }
  }, [text, showSuggestion, aiSuggestion]);

  const fetchAiSuggestion = async () => {
    setIsLoadingSuggestion(true);
    setSuggestionMessage("");
    setAiSuggestion("");

    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text, fieldType: fieldType || "message" }),
      });

      const data = await response.json();

      if (data.suggestion) {
        setAiSuggestion(data.suggestion);
      } else if (data.message) {
        setSuggestionMessage(data.message);
      }
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      setSuggestionMessage("Failed to generate AI suggestion. Please try again.");
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const acceptSuggestion = () => {
    if (aiSuggestion) {
      onAccept(aiSuggestion);
    }
    setShowSuggestion(false);
    setAiSuggestion("");
    setSuggestionMessage("");
  };

  const rejectSuggestion = () => {
    setShowSuggestion(false);
    setAiSuggestion("");
    setSuggestionMessage("");
  };

  // If not enough words typed, don't show anything
  const words = text.trim().split(/\s+/).filter((word) => word.length >= 3);
  if (words.length < 2) {
    return null;
  }

  return (
    <AnimatePresence>
      {showSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-3 rounded-lg border border-purple-500/30 bg-purple-500/10 p-3"
        >
          {!aiSuggestion && !suggestionMessage && (
            <button
              onClick={fetchAiSuggestion}
              disabled={isLoadingSuggestion}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingSuggestion ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <FaWandMagicSparkles className="h-4 w-4" />
                  </motion.div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FaWandMagicSparkles className="h-4 w-4" />
                  <span>Generate AI Suggestion</span>
                </>
              )}
            </button>
          )}

          {suggestionMessage && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{suggestionMessage}</p>
              <button
                onClick={rejectSuggestion}
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
              >
                <FaXmark className="h-4 w-4" />
              </button>
            </div>
          )}

          {aiSuggestion && (
            <div className="space-y-3">
              <div className="rounded-md bg-black/30 p-3">
                <p className="text-sm text-gray-300">{aiSuggestion}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={acceptSuggestion}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  <FaCheck className="h-3 w-3" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={rejectSuggestion}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  <FaXmark className="h-3 w-3" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
