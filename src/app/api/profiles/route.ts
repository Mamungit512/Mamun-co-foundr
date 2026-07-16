import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";
import { mapProfileToOnboardingData } from "@/lib/mapProfileToFromDBFormat";
import {
  filterProfilesByPreferences,
  scoreCandidate,
} from "@/features/matching/matchingService";
import { resolveTenantScope } from "@/features/school/auth/tenant-scope";

export async function GET(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    // Tenant context is anchored to the page's org slug (untrusted input,
    // validated server-side), NOT the HTTP host. `denied` → the viewer is not
    // a member of the requested school and isn't staff, so return nothing.
    const sessionOrgId = sessionClaims?.metadata?.organization_id ?? null;
    const slug = req.nextUrl.searchParams.get("org");
    const scope = await resolveTenantScope({ userId, sessionOrgId, slug });

    if (scope.kind === "denied") {
      return NextResponse.json({ profiles: [] });
    }

    // null = general pool, UUID = school tenant pool
    const useGeneralPool = scope.kind === "general";
    const scopeOrgId = scope.kind === "org" ? scope.orgId : null;

    // Resolve the set of onboarded members in the requested pool via the
    // membership table. profile_pool_memberships has owner-only RLS so we
    // must use the service-role client here (bypasses RLS, no JWT needed).
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const memberQuery = adminClient
      .from("profile_pool_memberships")
      .select("user_id")
      .not("onboarded_at", "is", null);

    const { data: memberRows } = useGeneralPool
      ? await memberQuery.is("organization_id", null)
      : await memberQuery.eq("organization_id", scopeOrgId);

    const memberIds = memberRows?.map((r: { user_id: string }) => r.user_id) ?? [];

    if (memberIds.length === 0) {
      return NextResponse.json({ profiles: [], currentUser: null });
    }

    // Get the current user's profile
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (currentUserError || !currentUserData) {
      return NextResponse.json(
        { error: "Current user profile not found" },
        { status: 404 },
      );
    }

    const currentUser = mapProfileToOnboardingData(currentUserData);

    // Get IDs of profiles the current user has already liked
    const { data: likedProfiles } = await supabase
      .from("likes")
      .select("liked_id")
      .eq("liker_id", currentUser.user_id);

    const likedIds = likedProfiles?.map((like) => like.liked_id) || [];

    // For any school tenant, restrict candidates to users who have completed
    // school-specific onboarding (i.e. have a row in school_profiles for this
    // org). Acts as the "verified school user" filter. Must be scoped by
    // organization_id to avoid leaking cross-tenant existence.
    const inSchoolTenant = !useGeneralPool && !!scopeOrgId;

    const collegeFilter = req.nextUrl.searchParams.get("college");
    const sectorsParam = req.nextUrl.searchParams.get("sectors");
    const gradYearParam = req.nextUrl.searchParams.get("gradYear");
    const intentFilter = req.nextUrl.searchParams.get("intent");

    const sectorFilters =
      sectorsParam
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) ?? [];

    const gradYearFilter =
      gradYearParam && !Number.isNaN(Number(gradYearParam))
        ? Number(gradYearParam)
        : null;

    let schoolUserIds: string[] | null = null;
    if (inSchoolTenant) {
      let schoolQuery = supabase
        .from("school_profiles")
        .select("user_id")
        .eq("organization_id", scopeOrgId);

      if (collegeFilter) {
        schoolQuery = schoolQuery.eq("college", collegeFilter);
      }
      if (gradYearFilter !== null) {
        schoolQuery = schoolQuery.eq("graduation_year", gradYearFilter);
      }
      if (sectorFilters.length > 0) {
        schoolQuery = schoolQuery.overlaps("sector_interests", sectorFilters);
      }
      if (intentFilter === "join_me" || intentFilter === "seeking_to_join") {
        schoolQuery = schoolQuery.in("intent", [intentFilter, "no_preference"]);
      }

      const { data: schoolRows } = await schoolQuery;
      schoolUserIds = schoolRows?.map((r) => r.user_id) ?? [];
    }

    // Fetch candidate profiles from the resolved member set (excludes self, deleted, already liked).
    // Pool filtering is now via membership IDs — profiles.organization_id is no longer authoritative
    // for pool membership after Design A.
    let query = supabase
      .from("profiles")
      .select("*")
      .neq("user_id", currentUser.user_id)
      .is("deleted_at", null)
      .in("user_id", memberIds);

    if (schoolUserIds !== null) {
      if (schoolUserIds.length === 0) {
        return NextResponse.json({ profiles: [], currentUser });
      }
      query = query.in("user_id", schoolUserIds);
    }

    if (likedIds.length > 0) {
      query = query.not("user_id", "in", `(${likedIds.join(",")})`);
    }

    // Fetch more candidates than we return so preference filtering still yields a full page
    const { data: profilesData, error } = await query.limit(50);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch profiles" },
        { status: 500 },
      );
    }

    if (!profilesData || profilesData.length === 0) {
      return NextResponse.json({ profiles: [], currentUser });
    }

    // Map and apply preference filters
    const mapped = profilesData.map(mapProfileToOnboardingData);
    const filtered = filterProfilesByPreferences(mapped, currentUser);

    if (filtered.length === 0) {
      return NextResponse.json({ profiles: [], currentUser });
    }

    const candidateIds = filtered
      .map((p) => p.user_id)
      .filter((id): id is string => Boolean(id));

    // For school-tenant orgs: fetch school-specific fields from the unified
    // school_profiles table and join them onto the profiles. Output keys stay
    // as utStatus/utCollege/etc. so the dashboard and UT form components keep
    // working without changes.
    let enrichedFiltered = filtered;
    if (inSchoolTenant && candidateIds.length > 0) {
      const { data: schoolRows } = await supabase
        .from("school_profiles")
        .select("user_id, school_status, graduation_year, college, degree_type, major, sector_interests, intent")
        .eq("organization_id", scopeOrgId)
        .in("user_id", candidateIds);

      const schoolMap = new Map(
        schoolRows?.map((row) => [
          row.user_id,
          {
            utStatus: row.school_status,
            gradYear: row.graduation_year,
            utCollege: row.college,
            utDegreeType: row.degree_type,
            utMajor: row.major,
            utSectorInterests: row.sector_interests,
            intent: row.intent,
          },
        ]) ?? [],
      );

      enrichedFiltered = filtered.map((profile) => {
        const school = schoolMap.get(profile.user_id!);
        return school ? { ...profile, ...school } : profile;
      });
    }

    // Fetch existing queue rows — cycle, seen_at are needed for ordering and "New" badge
    const { data: queueRows } = await supabase
      .from("matching_queue")
      .select("candidate_user_id, cycle, seen_at")
      .eq("viewer_user_id", userId)
      .in("candidate_user_id", candidateIds);

    const queueMap = new Map<string, { cycle: number; seenAt: string | null }>(
      queueRows?.map((r) => [
        r.candidate_user_id,
        { cycle: r.cycle as number, seenAt: r.seen_at },
      ]) ?? [],
    );

    // Ensure queue rows exist for any candidate not yet in the queue.
    // ignoreDuplicates: true → ON CONFLICT DO NOTHING, so existing cycle values are preserved.
    const newCandidateIds = candidateIds.filter((id) => !queueMap.has(id));
    if (newCandidateIds.length > 0) {
      await supabase.from("matching_queue").upsert(
        newCandidateIds.map((id) => ({
          viewer_user_id: userId,
          candidate_user_id: id,
          cycle: 0,
          updated_at: new Date().toISOString(),
        })),
        {
          onConflict: "viewer_user_id,candidate_user_id",
          ignoreDuplicates: true,
        },
      );
    }

    // If every eligible candidate has already been skipped at least once since the
    // last reset, the viewer has completed a full pass through the deck. Show the
    // empty state instead of looping the same candidates in score order forever.
    const roundComplete = enrichedFiltered.every(
      (profile) => (queueMap.get(profile.user_id!)?.cycle ?? 0) >= 1,
    );

    if (roundComplete) {
      return NextResponse.json({ profiles: [], currentUser, roundComplete: true });
    }

    // Sort by: cycle asc (skipped profiles go to back) → score desc (best match first within same cycle)
    const sorted = enrichedFiltered
      .map((profile) => {
        const queueInfo = queueMap.get(profile.user_id!) ?? { cycle: 0, seenAt: null };
        return {
          profile: { ...profile, isNew: queueInfo.seenAt === null },
          cycle: queueInfo.cycle,
          score: scoreCandidate(profile, currentUser),
        };
      })
      .sort((a, b) => {
        if (a.cycle !== b.cycle) return a.cycle - b.cycle;
        return b.score - a.score;
      })
      .slice(0, 20)
      .map((item) => item.profile);

    return NextResponse.json({ profiles: sorted, currentUser });
  } catch (error) {
    console.error("Error in profiles API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
