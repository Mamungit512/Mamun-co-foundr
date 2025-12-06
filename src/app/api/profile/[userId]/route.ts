import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { mapProfileToOnboardingData } from "@/lib/mapProfileToFromDBFormat";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    // Get the authenticated user from Clerk
    const { userId: requestingUserId } = await auth();

    if (!requestingUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the target user ID from params
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Authorization check: Only allow if:
    // 1. User is requesting their own profile, OR
    // 2. Users are in a conversation together, OR
    // 3. Users have liked each other (mutual match)
    const isOwnProfile = requestingUserId === userId;

    if (!isOwnProfile) {
      // Check if users are in a conversation together
      const { data: targetUserConversations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId);

      if (targetUserConversations && targetUserConversations.length > 0) {
        const conversationIds = targetUserConversations.map(
          (cp) => cp.conversation_id,
        );

        // Check if requesting user is in any of these conversations
        const { data: conversationCheck } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", requestingUserId)
          .in("conversation_id", conversationIds);

        const hasConversation =
          conversationCheck && conversationCheck.length > 0;

        if (!hasConversation) {
          // Check if users have mutual likes
          const { data: mutualLikesCheck } = await supabase
            .from("user_profile_actions")
            .select("profile_id")
            .eq("user_id", requestingUserId)
            .eq("action_type", "like")
            .eq("profile_id", userId);

          const { data: reverseLikesCheck } = await supabase
            .from("user_profile_actions")
            .select("profile_id")
            .eq("user_id", userId)
            .eq("action_type", "like")
            .eq("profile_id", requestingUserId);

          const hasMutualLikes =
            mutualLikesCheck &&
            reverseLikesCheck &&
            mutualLikesCheck.length > 0 &&
            reverseLikesCheck.length > 0;

          if (!hasMutualLikes) {
            return NextResponse.json(
              {
                error:
                  "Unauthorized: You can only view profiles of users you have a relationship with",
              },
              { status: 403 },
            );
          }
        }
      } else {
        // Target user has no conversations, check for mutual likes
        const { data: mutualLikesCheck } = await supabase
          .from("user_profile_actions")
          .select("profile_id")
          .eq("user_id", requestingUserId)
          .eq("action_type", "like")
          .eq("profile_id", userId);

        const { data: reverseLikesCheck } = await supabase
          .from("user_profile_actions")
          .select("profile_id")
          .eq("user_id", userId)
          .eq("action_type", "like")
          .eq("profile_id", requestingUserId);

        const hasMutualLikes =
          mutualLikesCheck &&
          reverseLikesCheck &&
          mutualLikesCheck.length > 0 &&
          reverseLikesCheck.length > 0;

        if (!hasMutualLikes) {
          return NextResponse.json(
            {
              error:
                "Unauthorized: You can only view profiles of users you have a relationship with",
            },
            { status: 403 },
          );
        }
      }
    }

    // Fetch the profile
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null) // Exclude soft-deleted profiles
      .single();

    if (error) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const mappedProfile = mapProfileToOnboardingData(data);

    return NextResponse.json({
      profile: mappedProfile,
    });
  } catch (error) {
    console.error("Error in profile by user ID API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}