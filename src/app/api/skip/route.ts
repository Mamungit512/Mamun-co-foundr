import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { skippedProfileId } = await request.json();

    if (!skippedProfileId) {
      return NextResponse.json(
        { error: "Missing skippedProfileId" },
        { status: 400 },
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Get internal profile IDs for both users
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    const { data: skippedProfile, error: skippedProfileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", skippedProfileId)
      .single();

    if (userProfileError || !userProfile) {
      console.error("Error fetching user profile:", userProfileError);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    if (skippedProfileError || !skippedProfile) {
      console.error("Error fetching skipped profile:", skippedProfileError);
      return NextResponse.json(
        { error: "Skipped profile not found" },
        { status: 404 },
      );
    }

    // Check if skip already exists
    const { data: existingSkip, error: checkError } = await supabase
      .from("user_profile_actions")
      .select("id")
      .eq("user_id", userProfile.id)
      .eq("other_profile_id", skippedProfile.id)
      .eq("action_type", "skip")
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing skip:", checkError);
      return NextResponse.json(
        { error: "Failed to check skip status" },
        { status: 500 },
      );
    }

    // If skip already exists, return success without inserting
    if (existingSkip) {
      console.log("Profile already skipped, skipping duplicate insert");
      return NextResponse.json({
        success: true,
        alreadySkipped: true,
      });
    }

    // Store skip in user_profile_actions table (only if doesn't exist)
    const { error: createSkipError } = await supabase
      .from("user_profile_actions")
      .insert({
        user_id: userProfile.id,
        other_profile_id: skippedProfile.id,
        action_type: "skip",
      });

    if (createSkipError) {
      console.error("Error saving skip:", createSkipError);
      return NextResponse.json(
        { error: `Error saving skip: ${createSkipError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, alreadySkipped: false });
  } catch (error) {
    console.error("Error in skip API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
