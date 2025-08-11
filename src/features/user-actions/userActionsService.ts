import { createSupabaseClientWithToken } from "../../lib/supabaseClient";

export async function createSkipProfileAction(
  userId: string,
  skippedProfileId: string,
  token: string,
) {
  const supabase = createSupabaseClientWithToken(token);
  const { error: CreateSkipError } = await supabase
    .from("user_profile_actions")
    .insert({
      user_id: userId,
      profile_id: skippedProfileId,
      action_type: "skip",
    });

  if (CreateSkipError) {
    console.error("Supabase returned an error:", CreateSkipError);
    throw new Error(`Error saving profile: ${CreateSkipError.message}`);
  }

  return { success: true };
}
