import { OnboardingData } from "@/app/onboarding/types";
import { supabase } from "./supabaseClient";

type UserProfileFromDb = {
  accomplishments: string | null;
  birthdate: string | null;
  city: string;
  cofounder_status: string | null;
  country: string;
  created_at: string;
  education: string;
  experience: string;
  extra: string | null;
  first_name: string;
  fulltime_timeline: string | null;
  gender: string | null;
  git: string | null;
  has_startup: boolean;
  hobbies: string | null;
  id: number;
  interests: string | null;
  is_technical: boolean;
  journey: string | null;
  last_name: string;
  linkedin: string | null;
  onboarding_complete: boolean;
  personal_intro: string;
  personal_website: string | null;
  priority_areas: string[]; // array of strings
  responsibilities: string[] | null;
  satisfaction: number;
  startup_description: string | null;
  startup_funding: string | null;
  startup_name: string | null;
  startup_time_spent: string | null;
  twitter: string | null;
  updated_at: string;
  user_id: string;
};

// Mapping Functions to Convert Data to/from Database
function mapProfileToOnboardingData(
  profile: UserProfileFromDb,
): OnboardingData {
  return {
    // WhoYouAreFormData
    firstName: profile.first_name,
    lastName: profile.last_name,
    city: profile.city,
    country: profile.country,
    satisfaction: profile.satisfaction,
    gender: profile.gender ?? undefined,
    birthdate: profile.birthdate ?? undefined,

    // IntroAccomplishmentsFormData
    personalIntro: profile.personal_intro,
    accomplishments: profile.accomplishments ?? undefined,
    education: profile.education,
    experience: profile.experience,
    isTechnical: profile.is_technical ? "yes" : "no",
    schedulingUrl: undefined, // No field provided in DB object, set to undefined

    // OnboardingSocialsFormData
    linkedin: profile.linkedin ?? "",
    twitter: profile.twitter ?? "",
    git: profile.git ?? "",
    personalWebsite: profile.personal_website ?? "",

    // StartupDetailsFormData
    hasStartup: profile.has_startup ? "yes" : "no",
    name: profile.startup_name ?? undefined,
    description: profile.startup_description ?? undefined,
    timeSpent: profile.startup_time_spent ?? undefined,
    funding: profile.startup_funding ?? undefined,
    coFounderStatus: profile.cofounder_status ?? undefined,
    fullTimeTimeline: profile.fulltime_timeline ?? undefined,
    responsibilities: profile.responsibilities ?? undefined,

    // InterestsAndValuesFormData
    interests: profile.interests ?? undefined,
    priorityAreas: profile.priority_areas ?? [],
    hobbies: profile.hobbies ?? undefined,
    journey: profile.journey ?? undefined,
    extra: profile.extra ?? undefined,
  };
}

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
  return mapProfileToOnboardingData(data) as OnboardingData;
}

// Upsert profile data
// export async function upsertProfile(profileData: any) {
//   const { data, error } = await supabase.from("profiles").upsert(profileData);

//   if (error) throw error;
//   return data;
// }
