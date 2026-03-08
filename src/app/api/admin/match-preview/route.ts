import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { sortProfiles } from "@/features/matching/matchingService";

/**
 * POST /api/admin/match-preview
 * Admin-only. Runs the matching algorithm on JSON input without any DB writes.
 * Body: { currentUser: OnboardingData, candidates: OnboardingData[] }
 * Returns: { profiles: OnboardingData[] } (sorted by relevance)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const currentUser = body?.currentUser;
    const candidates = body?.candidates;

    if (!currentUser || typeof currentUser !== "object") {
      return NextResponse.json(
        { error: "Body must include currentUser object" },
        { status: 400 },
      );
    }

    if (!Array.isArray(candidates)) {
      return NextResponse.json(
        { error: "Body must include candidates array" },
        { status: 400 },
      );
    }

    const sorted = sortProfiles(
      currentUser as OnboardingData,
      candidates as OnboardingData[],
    );

    return NextResponse.json({ profiles: sorted });
  } catch (error) {
    console.error("Error in admin match-preview API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
