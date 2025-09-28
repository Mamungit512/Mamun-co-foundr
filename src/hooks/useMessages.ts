import { useQuery } from "@tanstack/react-query";
import { useSession } from "@clerk/nextjs";
import { Message } from "@/features/messages/messagesService";
import { useState, useEffect } from "react";

// Polling configuration
const POLLING_INTERVAL = 5000; // 5 seconds
const POLLING_ENABLED = true; // Can be toggled for testing

async function fetchMessages(
  conversationId: string,
  token: string,
): Promise<Message[]> {
  const response = await fetch(`/api/messages/${conversationId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch messages");
  }

  const data = await response.json();
  return data.messages || [];
}

export function useMessages(conversationId: string) {
  const { session } = useSession();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    data: messages = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!session) throw new Error("No session");

      const token = await session.getToken();
      if (!token) throw new Error("No authentication token");

      return fetchMessages(conversationId, token);
    },
    enabled: !!session && !!conversationId && isClient && POLLING_ENABLED,
    staleTime: 0, // Data is always considered stale for real-time updates
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchInterval: POLLING_ENABLED ? POLLING_INTERVAL : false, // Poll every 5 seconds
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Track polling status
  const [pollingStatus, setPollingStatus] = useState<{
    isPolling: boolean;
    lastFetch: Date | null;
    nextFetch: Date | null;
  }>({
    isPolling: false,
    lastFetch: null,
    nextFetch: null,
  });

  // Update polling status
  useEffect(() => {
    if (isFetching) {
      setPollingStatus((prev) => ({
        ...prev,
        isPolling: true,
        lastFetch: new Date(),
      }));
    } else {
      setPollingStatus((prev) => ({
        ...prev,
        isPolling: false,
        nextFetch: new Date(Date.now() + POLLING_INTERVAL),
      }));
    }
  }, [isFetching]);

  // Calculate time until next fetch
  const getTimeUntilNextFetch = (): string => {
    if (!pollingStatus.nextFetch) return "Unknown";

    const timeMs = pollingStatus.nextFetch.getTime() - Date.now();
    const seconds = Math.ceil(timeMs / 1000);

    if (seconds <= 0) return "Now";
    return `${seconds}s`;
  };

  return {
    messages,
    isLoading,
    error: error as Error | null,
    refetch,
    isUsingCachedData: false, // Always using fresh data with polling
    canFetch: !!session && !!conversationId && isClient && POLLING_ENABLED,
    timeUntilNextFetch: getTimeUntilNextFetch(),
    isPolling: pollingStatus.isPolling,
    pollingEnabled: POLLING_ENABLED,
    pollingInterval: POLLING_INTERVAL,
    lastFetchTime: pollingStatus.lastFetch,
    nextFetchTime: pollingStatus.nextFetch,
  };
}
