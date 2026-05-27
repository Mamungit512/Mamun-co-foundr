import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { mapProfileToOnboardingData } from "@/lib/mapProfileToFromDBFormat";

export async function GET(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (q.length < 2) {
      return NextResponse.json({ profiles: [] });
    }

    const orgId = sessionClaims?.metadata?.organization_id ?? null;
    if (!orgId) {
      // Search is scoped to school tenants only
      return NextResponse.json({ profiles: [] });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Get IDs of profiles the current user has already liked
    const { data: likedProfiles } = await supabase
      .from("likes")
      .select("liked_id")
      .eq("liker_id", userId);
    const likedIds = likedProfiles?.map((l) => l.liked_id) ?? [];

    // Restrict candidates to users who have completed school onboarding for this org
    const { data: schoolRows } = await supabase
      .from("school_profiles")
      .select("user_id")
      .eq("organization_id", orgId);
    const schoolUserIds = schoolRows?.map((r) => r.user_id) ?? [];

    if (schoolUserIds.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

    // Eligible: in school org, not self, not already liked
    const eligible = schoolUserIds.filter(
      (id) => id !== userId && !likedIds.includes(id),
    );

    if (eligible.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

    // Build a prefix tsquery: each word gets :* so "fin" matches "finance", "eng" matches "engineering"
    // Sanitise each token to alphanumeric to prevent tsquery injection
    const tsquery = q
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.replace(/[^\w]/g, ""))
      .filter((w) => w.length > 0)
      .map((w) => `${w}:*`)
      .join(" & ");

    // FTS with prefix matching on profiles (name, bio, startup, interests, title, city)
    // Omitting `type` uses to_tsquery which accepts raw tsquery syntax including :*
    const { data: profileMatches } = await supabase
      .from("profiles")
      .select("user_id")
      .in("user_id", eligible)
      .is("deleted_at", null)
      .textSearch("search_tsv", tsquery, { config: "english" });

    // FTS with prefix matching on school_profiles (major, college, sector_interests)
    const { data: schoolMatches } = await supabase
      .from("school_profiles")
      .select("user_id")
      .eq("organization_id", orgId)
      .in("user_id", eligible)
      .textSearch("search_tsv", tsquery, { config: "english" });

    // ilike fallback for partial name matches (e.g. "Jo" → "John")
    const { data: nameMatches } = await supabase
      .from("profiles")
      .select("user_id")
      .in("user_id", eligible)
      .is("deleted_at", null)
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`);

    // Union matched user IDs from all sources
    const matchedSet = new Set([
      ...(profileMatches?.map((r) => r.user_id) ?? []),
      ...(schoolMatches?.map((r) => r.user_id) ?? []),
      ...(nameMatches?.map((r) => r.user_id) ?? []),
    ]);
    const matchedIds = Array.from(matchedSet);

    if (matchedIds.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

    // Fetch full profiles for matched IDs
    const { data: profilesData, error } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", matchedIds)
      .is("deleted_at", null)
      .eq("organization_id", orgId)
      .limit(30);

    if (error || !profilesData || profilesData.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

    const mapped = profilesData.map(mapProfileToOnboardingData);
    const candidateIds = mapped
      .map((p) => p.user_id)
      .filter((id): id is string => Boolean(id));

    // Enrich with school-specific fields
    const { data: schoolEnrichRows } = await supabase
      .from("school_profiles")
      .select(
        "user_id, school_status, graduation_year, college, degree_type, major, sector_interests",
      )
      .eq("organization_id", orgId)
      .in("user_id", candidateIds);

    const schoolMap = new Map(
      schoolEnrichRows?.map((row) => [
        row.user_id,
        {
          utStatus: row.school_status,
          gradYear: row.graduation_year,
          utCollege: row.college,
          utDegreeType: row.degree_type,
          utMajor: row.major,
          utSectorInterests: row.sector_interests,
        },
      ]) ?? [],
    );

    const enriched = mapped.map((profile) => {
      const school = schoolMap.get(profile.user_id!);
      return school ? { ...profile, ...school } : profile;
    });

    return NextResponse.json({ profiles: enriched });
  } catch (error) {
    console.error("Error in profiles search API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
