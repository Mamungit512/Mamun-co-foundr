// Get today's swipe count for a user
export async function getTodaySwipeCount(
  userId: string,
  token: string,
): Promise<{ count: number; error?: string }> {
  if (!userId) {
    return { count: 0, error: "Missing user ID" };
  }

  try {
    // Call the API route instead of directly accessing Supabase
    // This allows us to use the service role key server-side to bypass RLS
    const response = await fetch("/api/swipe-count", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error from swipe count API:", error);
      return { count: 0, error: error.error || "Failed to fetch swipe count" };
    }

    const data = await response.json();
    return { count: data.count };
  } catch (error) {
    console.error("Unexpected error in getTodaySwipeCount:", error);
    return { count: 0, error: "Unexpected error occurred" };
  }
}

// Check if user has reached their daily swipe limit
export async function hasReachedSwipeLimit(
  userId: string,
  token: string,
): Promise<{
  hasReachedLimit: boolean;
  currentCount: number;
  limit: number;
  error?: string;
}> {
  if (!userId) {
    return {
      hasReachedLimit: false,
      currentCount: 0,
      limit: 10,
      error: "Missing user ID",
    };
  }

  try {
    // Call the API route instead of directly accessing Supabase
    // This allows us to use the service role key server-side to bypass RLS
    const response = await fetch("/api/swipe-count", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error from swipe count API:", error);
      return {
        hasReachedLimit: false,
        currentCount: 0,
        limit: 10,
        error: error.error,
      };
    }

    const data = await response.json();
    return {
      hasReachedLimit: data.hasReachedLimit,
      currentCount: data.currentCount,
      limit: data.limit,
    };
  } catch (error) {
    console.error("Unexpected error in hasReachedSwipeLimit:", error);
    return {
      hasReachedLimit: false,
      currentCount: 0,
      limit: 10,
      error: "Unexpected error occurred",
    };
  }
}
