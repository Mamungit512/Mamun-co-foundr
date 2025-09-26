"use client";

import React from "react";
import ReactLenis from "lenis/react";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa6";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

function ConversationPage({ params }: ConversationPageProps) {
  const router = useRouter();
  const [conversationId, setConversationId] = React.useState<string>("");

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setConversationId(resolvedParams.conversationId);
    });
  }, [params]);

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

          {/* Placeholder Content */}
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
                Conversation View
              </h3>
              <p className="max-w-md text-sm text-white/70">
                This conversation view will be implemented with message
                functionality. Conversation ID: {conversationId}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </ReactLenis>
  );
}

export default ConversationPage;
