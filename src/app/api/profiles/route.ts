import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { mapProfileToOnboardingData } from "@/lib/mapProfileToFromDBFormat";
import {
  filterProfilesByPreferences,
  scoreCandidate,
} from "@/features/matching/matchingService";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Organization context: null = general pool, UUID = school tenant
    const orgId = sessionClaims?.metadata?.organization_id ?? null;

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

    // Fetch candidate profiles (excluding self, deleted, already liked)
    // Hard filter: candidates must belong to the same organization (or null for general pool)
    let query = supabase
      .from("profiles")
      .select("*")
      .neq("user_id", currentUser.user_id)
      .is("deleted_at", null);

    if (orgId) {
      query = query.eq("organization_id", orgId);
    } else {
      query = query.is("organization_id", null);
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

    // Fetch existing queue rows — only cycle is needed for ordering
    const { data: queueRows } = await supabase
      .from("matching_queue")
      .select("candidate_user_id, cycle")
      .eq("viewer_user_id", userId)
      .in("candidate_user_id", candidateIds);

    const queueMap = new Map<string, number>(
      queueRows?.map((r) => [r.candidate_user_id, r.cycle as number]) ?? [],
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

    // Sort by: cycle asc (skipped profiles go to back) → score desc (best match first within same cycle)
    const sorted = filtered
      .map((profile) => ({
        profile,
        cycle: queueMap.get(profile.user_id!) ?? 0,
        score: scoreCandidate(profile, currentUser),
      }))
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
