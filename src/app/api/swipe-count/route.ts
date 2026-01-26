import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Get today's date in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    console.log("Checking swipe count for user:", userId, "since:", todayISO);

    // Get user's internal profile ID first
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileError || !userProfile) {
      console.error("Error fetching user profile:", profileError);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
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
      return NextResponse.json(
        { error: "Failed to count likes" },
        { status: 500 },
      );
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
      return NextResponse.json(
        { error: "Failed to count skips" },
        { status: 500 },
      );
    }

    const totalSwipes = (likesCount || 0) + (skipsCount || 0);
    const limit = 10; // Free plan limit

    console.log(
      "Likes count:",
      likesCount,
      "Skips count:",
      skipsCount,
      "Total:",
      totalSwipes,
    );

    return NextResponse.json({
      count: totalSwipes,
      hasReachedLimit: totalSwipes >= limit,
      currentCount: totalSwipes,
      limit,
    });
  } catch (error) {
    console.error("Error in swipe count API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
