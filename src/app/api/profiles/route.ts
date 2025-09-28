import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { mapProfileToOnboardingData } from "@/lib/mapProfileToFromDBFormat";
import { sortProfiles } from "@/features/matching/matchingService";

export async function GET() {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // First, get the current user's profile
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (currentUserError || !currentUserData) {
      return NextResponse.json(
        { error: "Current user profile not found" },
        { status: 404 },
      );
    }

    const currentUser = mapProfileToOnboardingData(currentUserData);

    // Get all profiles that the current user has liked
    const { data: likedProfiles, error: likedError } = await supabase
      .from("likes")
      .select("liked_id")
      .eq("liker_id", currentUser.user_id);

    if (likedError) {
      // Continue without filtering if there's an error fetching likes
    }

    const likedIds = likedProfiles?.map((like) => like.liked_id) || [];

    // Get profiles excluding current user, deleted profiles, and already liked profiles
    let query = supabase
      .from("profiles")
      .select("*")
      .neq("user_id", currentUser.user_id) // Exclude current user's profile
      .is("deleted_at", null); // Exclude soft-deleted profiles

    // Exclude already liked profiles if there are any
    if (likedIds.length > 0) {
      query = query.not("user_id", "in", `(${likedIds.join(",")})`);
    }

    const { data: profiles, error } = await query.limit(20); // batch fetching

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch profiles" },
        { status: 500 },
      );
    }

    if (!profiles) {
      return NextResponse.json({ profiles: [] });
    }

    const mappedProfiles = profiles.map(mapProfileToOnboardingData);

    // Sort profiles based on scoring algorithm
    const sorted = sortProfiles(currentUser, mappedProfiles);

    return NextResponse.json({
      profiles: sorted,
      currentUser,
    });
  } catch (error) {
    console.error("Error in profiles API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
