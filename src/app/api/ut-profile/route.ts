import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { mapOnboardingDatatoProfileDB } from "@/lib/mapProfileToFromDBFormat";

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = sessionClaims?.metadata?.organization_id;
    if (!orgId) {
      return NextResponse.json(
        { error: "organization_id missing on session — user is not associated with a school" },
        { status: 400 },
      );
    }

    const body: OnboardingData = await request.json();

    if (!body) {
      return NextResponse.json({ error: "Profile data is required" }, { status: 400 });
    }

    // School-tenant required field validation (server-side)
    if (!body.utStatus) {
      return NextResponse.json(
        { error: "utStatus is required for school profiles" },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Preserve existing pfp_url if not supplied
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("pfp_url")
      .eq("user_id", userId)
      .single();

    if (!body.pfp_url && !existingProfile?.pfp_url) {
      return NextResponse.json(
        { error: "Profile picture is required. Please upload a photo before continuing." },
        { status: 400 },
      );
    }

    // Compose education string from UT fields for the profiles table
    const educationStr = [
      body.utCollege,
      body.gradYear ? `Class of ${body.gradYear}` : null,
    ]
      .filter(Boolean)
      .join(", ") || "UT Austin";

    // Map shared fields, then override UT-unused required fields with safe defaults
    const dbData = {
      ...mapOnboardingDatatoProfileDB(body),
      education: educationStr,
      satisfaction: "Browsing" as const,
      battery_level: "Energized" as const,
    };

    if (existingProfile?.pfp_url && !dbData.pfp_url) {
      dbData.pfp_url = existingProfile.pfp_url;
    }

    // 1. Upsert shared profile fields
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ user_id: userId, ...dbData }, { onConflict: "user_id" });

    if (profileError) {
      console.error("Supabase profiles upsert error:", profileError);
      return NextResponse.json(
        { error: `Error saving profile: ${profileError.message}` },
        { status: 500 },
      );
    }

    // 2. Upsert school-specific fields. Persisted in the unified school_profiles
    //    table; the request body keys (utStatus, utCollege, ...) are the
    //    application-layer contract with the UT form components and are
    //    translated to generic column names here.
    const { error: schoolError } = await supabase
      .from("school_profiles")
      .upsert(
        {
          user_id: userId,
          organization_id: orgId,
          school_status: body.utStatus,
          graduation_year: body.gradYear ?? null,
          college: body.utCollege ?? null,
          degree_type: body.utDegreeType ?? null,
          major: body.utMajor ?? null,
          sector_interests: body.utSectorInterests ?? null,
          additional_education: body.additionalEducation ?? null,
        },
        { onConflict: "user_id" },
      );

    if (schoolError) {
      console.error("Supabase school_profiles upsert error:", schoolError);
      return NextResponse.json(
        { error: `Error saving school profile: ${schoolError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: "School profile saved successfully" });
  } catch (error) {
    console.error("Error in UT profile upsert API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
