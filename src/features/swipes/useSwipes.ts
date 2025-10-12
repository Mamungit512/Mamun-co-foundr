import { useQuery } from "@tanstack/react-query";
import { useSession } from "@clerk/nextjs";
import { getTodaySwipeCount, hasReachedSwipeLimit } from "./swipeService";

// Hook to get today's swipe count
export function useTodaySwipeCount() {
  const { session } = useSession();

  return useQuery({
    queryKey: ["today-swipe-count"],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("No user ID");

      const token = await session.getToken();
      if (!token) throw new Error("No authentication token");

      return await getTodaySwipeCount(session.user.id, token);
    },
    enabled: !!session,
    staleTime: 30 * 1000, // Consider stale after 30 seconds
    refetchOnWindowFocus: true,
  });
}

// Hook to check if user has reached swipe limit
export function useSwipeLimit() {
  const { session } = useSession();

  return useQuery({
    queryKey: ["swipe-limit"],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("No user ID");

      const token = await session.getToken();
      if (!token) throw new Error("No authentication token");

      return await hasReachedSwipeLimit(session.user.id, token);
    },
    enabled: !!session,
    staleTime: 30 * 1000, // Consider stale after 30 seconds
    refetchOnWindowFocus: true,
  });
}

