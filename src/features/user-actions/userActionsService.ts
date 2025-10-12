import { createSupabaseClientWithToken } from "../../lib/supabaseClient";

export async function createSkipProfileAction(
  userId: string,
  skippedProfileId: string,
  token: string,
) {
  const supabase = createSupabaseClientWithToken(token);

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
    throw new Error("User profile not found");
  }

  if (skippedProfileError || !skippedProfile) {
    console.error("Error fetching skipped profile:", skippedProfileError);
    throw new Error("Skipped profile not found");
  }

  // Store skip in user_profile_actions table
  const { error: CreateSkipError } = await supabase
    .from("user_profile_actions")
    .insert({
      user_id: userProfile.id, // Internal profile ID of user who skipped
      other_profile_id: skippedProfile.id, // Internal profile ID of profile that was skipped
      action_type: "skip",
    });

  if (CreateSkipError) {
    console.error("Supabase returned an error:", CreateSkipError);
    throw new Error(`Error saving skip: ${CreateSkipError.message}`);
  }

  console.log(
    "Skip action created successfully in user_profile_actions table:",
    {
      userId: userProfile.id,
      otherProfileId: skippedProfile.id,
      actionType: "skip",
    },
  );

  return { success: true };
}
