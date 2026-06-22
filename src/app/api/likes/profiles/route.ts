import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { mapProfileToOnboardingData } from "@/lib/mapProfileToFromDBFormat";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    const orgId =
      ((sessionClaims?.metadata as Record<string, unknown>)
        ?.organization_id as string | undefined) ?? null;

    // Get IDs of profiles the user has liked
    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("liked_id")
      .eq("liker_id", userId);

    if (likesError) {
      console.error("Error fetching liked profiles:", likesError);
      return NextResponse.json(
        { error: "Failed to fetch likes" },
        { status: 500 },
      );
    }

    if (!likes || likes.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

    const likedIds = likes.map((l) => l.liked_id);

    // Get full profile data, scoped to the user's organization
    let profileQuery = supabase
      .from("profiles")
      .select("*")
      .in("user_id", likedIds)
      .is("deleted_at", null);

    if (orgId) {
      profileQuery = profileQuery.eq("organization_id", orgId);
    } else {
      profileQuery = profileQuery.is("organization_id", null);
    }

    const { data: profiles, error: profilesError } = await profileQuery;

    if (profilesError) {
      console.error("Error fetching profile data:", profilesError);
      return NextResponse.json(
        { error: "Failed to fetch profiles" },
        { status: 500 },
      );
    }

    let mapped = (profiles ?? []).map(mapProfileToOnboardingData);

    // For school tenants, enrich with school_profiles data
    if (orgId && mapped.length > 0) {
      const userIds = mapped
        .map((p) => p.user_id)
        .filter((id): id is string => Boolean(id));

      const { data: schoolRows } = await supabase
        .from("school_profiles")
        .select(
          "user_id, school_status, graduation_year, college, degree_type, major, sector_interests",
        )
        .eq("organization_id", orgId)
        .in("user_id", userIds);

      if (schoolRows && schoolRows.length > 0) {
        const schoolMap = new Map(
          schoolRows.map((row) => [
            row.user_id,
            {
              utStatus: row.school_status,
              gradYear: row.graduation_year,
              utCollege: row.college,
              utDegreeType: row.degree_type,
              utMajor: row.major,
              utSectorInterests: row.sector_interests,
            },
          ]),
        );

        mapped = mapped.map((profile) => {
          const school = schoolMap.get(profile.user_id!);
          return school ? { ...profile, ...school } : profile;
        });
      }
    }

    return NextResponse.json({ profiles: mapped });
  } catch (error) {
    console.error("Error in liked profiles API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
