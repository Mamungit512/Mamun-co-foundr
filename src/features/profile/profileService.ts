import { createSupabaseClientWithToken } from "../../lib/supabaseClient";

// Mapping Functions to Convert Data to/from Database
function mapProfileToOnboardingData(
  profile: UserProfileFromDb,
): OnboardingData {
  return {
    // WhoYouAreFormData
    firstName: profile.first_name,
    lastName: profile.last_name,
    title: profile.title,
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

// Convert OnboardingData into Supabase-compliant format
const mapOnboardingDatatoProfileDB = (data: OnboardingData) => {
  return {
    first_name: data.firstName || null,
    last_name: data.lastName || null,
    title: data.title,
    city: data.city || null,
    country: data.country || null,
    satisfaction: data.satisfaction ?? null,
    gender: data.gender || null,
    birthdate: data.birthdate ? new Date(data.birthdate) : null,

    personal_intro: data.personalIntro || null,
    accomplishments: data.accomplishments || null,
    education: data.education || null,
    experience: data.experience || null,
    is_technical: data.isTechnical === "yes",

    linkedin: data.linkedin || null,
    twitter: data.twitter || null,
    git: data.git || null,
    personal_website: data.personalWebsite || null,

    has_startup: data.hasStartup === "yes",
    startup_name: data.name || null,
    startup_description: data.description || null,
    startup_time_spent: data.timeSpent || null,
    startup_funding: data.funding || null,
    cofounder_status: data.coFounderStatus || null,
    fulltime_timeline: data.fullTimeTimeline || null,
    responsibilities: data.responsibilities || null,

    interests: data.interests || null,
    priority_areas: data.priorityAreas || null,
    hobbies: data.hobbies || null,
    journey: data.journey || null,
    extra: data.extra || null,

    onboarding_complete: true,
  };
};

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
    .single();

  if (error) throw error;
  return mapProfileToOnboardingData(data) as OnboardingData;
}

// Get 20 profiles (batch fetching)
export async function getProfiles({ token }: { token: string }) {
  const supabase = createSupabaseClientWithToken(token);

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(20);

  if (error) {
    throw error;
    console.error(error);
  }

  return profiles;
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
