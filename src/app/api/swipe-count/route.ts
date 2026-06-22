import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // School org users have no swipe limits
    const orgId = (sessionClaims?.metadata as Record<string, unknown>)?.organization_id as string | undefined ?? null;
    if (orgId) {
      return NextResponse.json({
        count: 0,
        hasReachedLimit: false,
        currentCount: 0,
        limit: Infinity,
      });
    }

    const supabase = await createServerSupabaseClient();

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

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
    const limit = 10;

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
