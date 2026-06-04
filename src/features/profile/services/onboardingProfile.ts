import { createClient } from "@supabase/supabase-js";
import {
  mapOnboardingDatatoProfileDB,
  mapProfileToOnboardingData,
  mapSchoolProfileToUTData,
  mapUTDataToSchoolProfileRow,
} from "@/lib/mapProfileToFromDBFormat";

// Shared onboarding-profile service used by the unified /api/profile endpoint
// (and its deprecated /api/ut-profile alias). A user's school membership is
// derived from organization_id on the Clerk session: when present, the school
// path additionally validates and persists a school_profiles row.

function serviceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export type SaveProfileResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

// Reads the user's profile, merging school_profiles fields when a row exists.
// Returns null when the base profile is missing (or soft-deleted).
export async function getOnboardingProfile(
  userId: string,
): Promise<OnboardingData | null> {
  const supabase = serviceRoleClient();

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (profileError || !profileRow) return null;

  const { data: schoolRow } = await supabase
    .from("school_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    ...mapProfileToOnboardingData(profileRow),
    ...(schoolRow ? mapSchoolProfileToUTData(schoolRow) : {}),
  };
}

// Upserts a user's profile. When organizationId is set the user belongs to a
// school: school-required fields are validated, school-only defaults are
// applied to the shared profiles row, and a school_profiles row is written.
export async function saveOnboardingProfile({
  userId,
  organizationId,
  formData,
}: {
  userId: string;
  organizationId?: string | null;
  formData: OnboardingData;
}): Promise<SaveProfileResult> {
  if (!userId) return { ok: false, status: 401, error: "Unauthorized" };
  if (!formData) return { ok: false, status: 400, error: "Profile data is required" };

  const isSchool = !!organizationId;

  // If the payload carries school-specific fields but the session has no
  // organization_id, the Clerk session is stale or misconfigured. Reject
  // explicitly rather than silently writing a profile without the school row.
  if (formData.utStatus && !isSchool) {
    return {
      ok: false,
      status: 400,
      error: "organization_id missing from session — please sign out and sign back in",
    };
  }

  if (isSchool && !formData.utStatus) {
    return {
      ok: false,
      status: 400,
      error: "utStatus is required for school profiles",
    };
  }

  const supabase = serviceRoleClient();

  // Preserve an existing profile photo when the form omits it.
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("pfp_url")
    .eq("user_id", userId)
    .single();

  if (!formData.pfp_url && !existingProfile?.pfp_url) {
    return {
      ok: false,
      status: 400,
      error: "Profile picture is required. Please upload a photo before continuing.",
    };
  }

  let dbData = mapOnboardingDatatoProfileDB(formData);

  if (isSchool) {
    // School profiles don't collect general satisfaction/battery fields and
    // derive education from the school-specific college/grad-year inputs.
    const educationStr =
      [formData.utCollege, formData.gradYear ? `Class of ${formData.gradYear}` : null]
        .filter(Boolean)
        .join(", ") || "UT Austin";

    dbData = {
      ...dbData,
      education: educationStr,
      satisfaction: "Browsing" as const,
      battery_level: "Energized" as const,
    };
  }

  if (existingProfile?.pfp_url && !dbData.pfp_url) {
    dbData.pfp_url = existingProfile.pfp_url;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      ...(organizationId ? { organization_id: organizationId } : {}),
      ...dbData,
    },
    { onConflict: "user_id" },
  );

  if (profileError) {
    console.error("Supabase profiles upsert error:", profileError);
    return {
      ok: false,
      status: 500,
      error: `Error saving profile: ${profileError.message}`,
    };
  }

  if (isSchool) {
    const { error: schoolError } = await supabase
      .from("school_profiles")
      .upsert(mapUTDataToSchoolProfileRow(formData, userId, organizationId!), {
        onConflict: "user_id",
      });

    if (schoolError) {
      console.error("Supabase school_profiles upsert error:", schoolError);
      return {
        ok: false,
        status: 500,
        error: `Error saving school profile: ${schoolError.message}`,
      };
    }
  }

  return { ok: true };
}
