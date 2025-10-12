import { createSupabaseClientWithToken } from "../../lib/supabaseClient";

// Get today's swipe count for a user
export async function getTodaySwipeCount(
  userId: string,
  token: string,
): Promise<{ count: number; error?: string }> {
  if (!userId) {
    return { count: 0, error: "Missing user ID" };
  }

  const supabase = createSupabaseClientWithToken(token);

  // Get today's date in UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  console.log("Checking swipe count for user:", userId, "since:", todayISO);

  try {
    // Get user's internal profile ID first
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileError || !userProfile) {
      console.error("Error fetching user profile:", profileError);
      return { count: 0, error: "User profile not found" };
    }

    const userProfileId = userProfile.id;

    // Count likes from likes table
    const { count: likesCount, error: likesError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("liker_id", userId)
      .gte("created_at", todayISO);

    if (likesError) {
      console.error("Error counting likes:", likesError);
      return { count: 0, error: "Failed to count likes" };
    }

    // Count skips from user_profile_actions table
    const { count: skipsCount, error: skipsError } = await supabase
      .from("user_profile_actions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userProfileId)
      .eq("action_type", "skip")
      .gte("created_at", todayISO);

    if (skipsError) {
      console.error("Error counting skips:", skipsError);
      return { count: 0, error: "Failed to count skips" };
    }

    const totalSwipes = (likesCount || 0) + (skipsCount || 0);
    console.log(
      "Likes count:",
      likesCount,
      "Skips count:",
      skipsCount,
      "Total:",
      totalSwipes,
    );
    return { count: totalSwipes };
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
  const { count, error } = await getTodaySwipeCount(userId, token);

  if (error) {
    return { hasReachedLimit: false, currentCount: 0, limit: 10, error };
  }

  const limit = 10; // Free plan limit
  return {
    hasReachedLimit: count >= limit,
    currentCount: count,
    limit,
  };
}
