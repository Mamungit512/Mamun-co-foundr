import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST() {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client with service role key for backend operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Get the internal profile ID before deleting
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const internalProfileId = profile.id;

    // 1. Delete profile pictures from storage
    try {
      const { data: oldFiles, error: listError } = await supabase.storage
        .from("profile-pic")
        .list("", {
          search: userId,
        });

      if (!listError && oldFiles && oldFiles.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from("profile-pic")
          .remove(oldFiles.map((file) => file.name));

        if (deleteError) {
          console.error("Error deleting profile pictures:", deleteError);
        }
      }
    } catch (storageError) {
      console.error("Error during profile picture cleanup:", storageError);
    }

    // 2. Delete messages sent by the user
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("sender_id", userId);

    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
    }

    // 3. Delete conversation participants records
    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .delete()
      .eq("user_id", userId);

    if (participantsError) {
      console.error(
        "Error deleting conversation participants:",
        participantsError,
      );
    }

    // 4. Delete likes where user is the liker or liked
    const { error: likesError } = await supabase
      .from("likes")
      .delete()
      .or(`liker_id.eq.${userId},liked_id.eq.${userId}`);

    if (likesError) {
      console.error("Error deleting likes:", likesError);
    }

    // 5. Delete user profile actions (skips, etc.) using internal profile ID
    const { error: actionsError } = await supabase
      .from("user_profile_actions")
      .delete()
      .or(
        `user_id.eq.${internalProfileId},other_profile_id.eq.${internalProfileId}`,
      );

    if (actionsError) {
      console.error("Error deleting user profile actions:", actionsError);
    }

    // 6. Delete the profile from Supabase
    const { error: deleteProfileError } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (deleteProfileError) {
      console.error("Error deleting profile:", deleteProfileError);
      return NextResponse.json(
        { error: "Failed to delete profile from database" },
        { status: 500 },
      );
    }

    // 7. Delete the user from Clerk
    try {
      const client = await clerkClient();
      await client.users.deleteUser(userId);
    } catch (clerkError) {
      console.error("Error deleting user from Clerk:", clerkError);
      // Don't fail the request if Clerk deletion fails
      // The Supabase data is already deleted
    }

    // 8. Track account deletion in PostHog (churn event)
    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: userId,
        event: "account_deleted",
        properties: {
          deletion_source: "user_initiated",
        },
      });
      await posthog.shutdown();
    } catch (posthogError) {
      console.error(
        "Error tracking account deletion in PostHog:",
        posthogError,
      );
      // Don't fail the request if PostHog tracking fails
    }

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in delete-profile endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
