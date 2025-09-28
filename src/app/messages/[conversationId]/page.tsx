"use client";

import React from "react";
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
  const [messageInput, setMessageInput] = React.useState<string>("");
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = React.useState<boolean>(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setConversationId(resolvedParams.conversationId);
    });
  }, [params]);

  const { messages, isLoading, error, sendMessage } =
    useMessages(conversationId);
  const currentUserId = session?.user?.id;

  // Auto-scroll to bottom when new messages arrive
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
      setMessageInput("");
    } catch (error: unknown) {
      console.error("Failed to send message:", error);

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
              <p className="text-xs text-gray-500">
                {messages.length}/20 messages
              </p>
            </div>
          </div>
        </motion.div>

        {/* Notifications - Always Visible */}
        <div className="space-y-3">
          {/* Privacy Notice */}
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/20 p-3">
            <div className="mb-2 flex items-center gap-2 text-blue-400">
              <div className="h-4 w-4 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium">Privacy Notice</span>
            </div>
            <p className="text-xs text-blue-300">
              This is a starting point to connect outside of Mamun. Messages are
              not encrypted, so please don&apos;t write any sensitive data in
              the chat.
            </p>
          </div>

          {/* Message Limit Notification */}
          {messages.length >= 20 && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/20 p-3">
              <div className="mb-2 flex items-center gap-2 text-orange-400">
                <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                <span className="text-sm font-medium">
                  Message Limit Reached
                </span>
              </div>
              <p className="text-xs text-orange-300">
                You&apos;ve reached the 20-message limit for this conversation.
                This is a starting point to connect outside of Mamun.
              </p>
            </div>
          )}

          {/* Send Error Notification */}
          {sendError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/20 p-3">
              <div className="flex items-center gap-2 text-red-400">
                <div className="h-4 w-4 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="mt-1 text-xs text-red-300">{sendError}</p>
              {isLimitReached && (
                <p className="mt-2 text-xs text-red-200">
                  💡 This is a starting point to connect outside of Mamun.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Messages Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex h-[600px] flex-col rounded-lg border border-gray-700 bg-gray-800/50"
        >
          {/* Messages Container */}
          <div className="chat-scroll h-[500px] p-4">
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
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Area */}
          <div className="border-t border-gray-700 p-4">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-3"
            >
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={
                    messages.length >= 20
                      ? "Message limit reached - This is a starting point to connect outside of Mamun"
                      : "Type a message..."
                  }
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  disabled={isSending || messages.length >= 20}
                  maxLength={1000}
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  !messageInput.trim() || isSending || messages.length >= 20
                }
              >
                {isSending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send"
                )}
              </button>
            </form>
            <p className="mt-2 text-center text-xs text-gray-500">
              Press Enter or click Send to send your message
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ConversationPage;
