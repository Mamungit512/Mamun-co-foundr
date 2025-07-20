import { OnboardingData } from "@/app/onboarding/types";
import { supabase } from "./supabaseClient";

// Fetch profile by userId
export async function getProfileByUserId(
  userId: string,
): Promise<OnboardingData> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data as OnboardingData;
}

// Upsert profile data
// export async function upsertProfile(profileData: any) {
//   const { data, error } = await supabase.from("profiles").upsert(profileData);

//   if (error) throw error;
//   return data;
// }
