import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { mapProfileToOnboardingData } from "@/lib/mapProfileToFromDBFormat";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const EMBED_FN_URL = `${SUPABASE_URL}/functions/v1/embed`;

async function getQueryEmbedding(q: string): Promise<number[] | null> {
  try {
    const res = await fetch(EMBED_FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ mode: "query", text: q }),
    });

    if (!res.ok) return null;
    const { embedding } = await res.json();
    return embedding ?? null;
  } catch {
    return null;
  }
}

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
      return NextResponse.json({ profiles: [] });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

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

    // Build a prefix tsquery: each word gets :* so "fin" matches "finance"
    // Sanitise each token to alphanumeric to prevent tsquery injection
    const tsquery = q
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.replace(/[^\w]/g, ""))
      .filter((w) => w.length > 0)
      .map((w) => `${w}:*`)
      .join(" & ");

    // Get semantic embedding for the query — fetch in parallel with nothing else blocked on it
    const queryEmbedding = await getQueryEmbedding(q);

    // Single RPC: runs FTS, school-FTS, vector, and name-ILIKE branches,
    // combines via RRF, returns top 30 user_ids in ranked order.
    // Profiles without an embedding still appear via the FTS and name branches.
    const { data: ranked, error: rpcError } = await supabase.rpc(
      "search_profiles_hybrid",
      {
        eligible_ids: eligible,
        query_text: tsquery,
        query_vec: queryEmbedding,
      },
    );

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return NextResponse.json({ profiles: [] });
    }

    const matchedIds = (ranked ?? []).map(
      (r: { user_id: string }) => r.user_id,
    );

    if (matchedIds.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

    // Fetch full profiles for matched IDs, preserving RRF order
    const { data: profilesData, error } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", matchedIds)
      .is("deleted_at", null)
      .eq("organization_id", orgId);

    if (error || !profilesData || profilesData.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

    const mapped = profilesData.map(mapProfileToOnboardingData);

    // Re-sort to preserve RRF ranking order (Supabase .in() doesn't guarantee order)
    const rankIndex = new Map<string, number>(matchedIds.map((id: string, i: number) => [id, i]));
    mapped.sort(
      (a, b) => (rankIndex.get(a.user_id!) ?? 999) - (rankIndex.get(b.user_id!) ?? 999),
    );

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
