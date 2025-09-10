import {
  mapOnboardingDatatoProfileDB,
  mapProfileToOnboardingData,
} from "@/lib/mapProfileToFromDBFormat";
import { createSupabaseClientWithToken } from "../../lib/supabaseClient";
import { sortProfiles } from "../matching/matchingService";

// Fetch profile by userId
export async function getProfileByUserId(
  userId: string,
  token: string,
): Promise<OnboardingData> {
  const supabase = createSupabaseClientWithToken(token);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null) // Exclude soft-deleted profiles
    .single();

  if (error) throw error;

  if (!data) throw new Error("No profile found");
  return mapProfileToOnboardingData(data) as OnboardingData;
}

// Get Profiles: Gets 20 profiles (batch fetching) and sorts them by relevance using sorting algorithm
export async function getProfiles(
  { token }: { token: string },
  currentUser: OnboardingData,
) {
  const supabase = createSupabaseClientWithToken(token);

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("user_id", currentUser.user_id) // Exclude current user's profile
    .is("deleted_at", null) // Exclude soft-deleted profiles
    .limit(20);

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
