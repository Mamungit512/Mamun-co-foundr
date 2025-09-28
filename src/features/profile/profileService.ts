import {
  mapOnboardingDatatoProfileDB,
  mapProfileToOnboardingData,
} from "@/lib/mapProfileToFromDBFormat";
import { createSupabaseClientWithToken } from "../../lib/supabaseClient";
import { sortProfiles } from "../matching/matchingService";

// Fetch profile by userId - with authorization check
export async function getProfileByUserId(
  userId: string,
  token: string,
  requestingUserId?: string,
): Promise<OnboardingData> {
  const supabase = createSupabaseClientWithToken(token);

  // Get the requesting user's ID if not provided
  if (!requestingUserId) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    requestingUserId = user?.id;
  }

  // Authorization check: Only allow if:
  // 1. User is requesting their own profile, OR
  // 2. Users are in a conversation together, OR
  // 3. Users have liked each other (mutual match)
  const isOwnProfile = requestingUserId === userId;

  if (!isOwnProfile) {
    // Check if users are in a conversation together
    // First get conversations for the target user
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

      const hasConversation = conversationCheck && conversationCheck.length > 0;

      if (hasConversation) {
        // User has conversation access, allow profile view
      } else {
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
          throw new Error(
            "Unauthorized: You can only view profiles of users you have a relationship with",
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
        throw new Error(
          "Unauthorized: You can only view profiles of users you have a relationship with",
        );
      }
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null) // Exclude soft-deleted profiles
    .single();

  if (error) {
    console.error("Error fetching profile for user:", userId, error);
    throw error;
  }

  if (!data) {
    console.error("No profile found for user:", userId);
    throw new Error("No profile found");
  }

  console.log("Successfully fetched profile for user:", userId);
  return mapProfileToOnboardingData(data) as OnboardingData;
}

// Get Profiles: Gets 20 profiles (batch fetching) and sorts them by relevance using sorting algorithm
export async function getProfiles(
  { token }: { token: string },
  currentUser: OnboardingData,
) {
  const supabase = createSupabaseClientWithToken(token);

  // First, get all profiles that the current user has liked
  const { data: likedProfiles, error: likedError } = await supabase
    .from("likes")
    .select("liked_id")
    .eq("liker_id", currentUser.user_id);

  if (likedError) {
    console.error("Error fetching liked profiles:", likedError);
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
    throw error;
    console.error(error);
  }

  if (!profiles) return [];

  const mappedProfiles = profiles.map(mapProfileToOnboardingData);

  // --- Sort profiles based on scoring algorithm ---
  const sorted = sortProfiles(currentUser, mappedProfiles);

  return sorted;
}

// Fetch profiles (excluding skipped)
export async function getProfilesNoSkipped({ token }: { token: string }) {
  const supabase = createSupabaseClientWithToken(token);

  // --- Get User ID ---
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User not found");

  const currentUserId = user.id;

  // --- Fetch Profiles ---
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", currentUserId)
    .is("deleted_at", null) // Exclude soft-deleted profiles
    .not(
      "id",
      "in",
      supabase
        .from("user_profile_actions")
        .select("profile_id")
        .eq("user_id", currentUserId)
        .eq("action_type", "skip"),
    )
    .limit(1);

  if (error) {
    throw error;
    console.error(error);
  }

  return profiles;
}

// Upsert profile data
export async function upsertUserProfile({
  userId,
  token,
  formData,
}: {
  userId: string;
  token: string;
  formData: OnboardingData;
}): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "Missing user ID" };

  // -- Upsert into Supabase "profiles" table --
  const dbData = mapOnboardingDatatoProfileDB(formData);

  const supabase = createSupabaseClientWithToken(token);

  const { error: dbError } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      ...dbData,
    },
    { onConflict: "user_id" },
  );

  if (dbError) {
    console.error("Supabase returned an error:", dbError);
    throw new Error(`Error saving profile: ${dbError.message}`);
  }

  return { success: true };
}

// -- Create new TEST profile (admin role required) --
export async function createUserProfile({
  userId,
  token,
  formData,
}: {
  userId: string;
  token: string;
  formData: OnboardingData;
}): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "Missing user ID" };

  const supabase = createSupabaseClientWithToken(token);

  // --- Check if user is an admin ---
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin") // or .select("role") depending on your schema
    .eq("user_id", userId)
    .is("deleted_at", null) // Exclude soft-deleted profiles
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return { success: false, error: "Failed to verify admin status" };
  }

  if (!profile?.is_admin) {
    return { success: false, error: "Unauthorized: Admin access required" };
  }

  // --- Insert profile data ---

  const dbData = mapOnboardingDatatoProfileDB(formData);

  const { error: dbError } = await supabase.from("profiles").insert([
    {
      ...dbData,
      user_id: formData.user_id,
    },
  ]);

  if (dbError) {
    console.error("Error inserting profile:", dbError);
    throw new Error(`Error saving profile: ${dbError.message}`);
  }

  return { success: true };
}
