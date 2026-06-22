import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

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

    // Get profiles the user has liked
    const { data: userLikes, error: userLikesError } = await supabase
      .from("likes")
      .select("liked_id")
      .eq("liker_id", userId);

    if (userLikesError) {
      console.error("Error fetching user likes:", userLikesError);
      return NextResponse.json(
        { error: "Failed to fetch likes" },
        { status: 500 },
      );
    }

    if (!userLikes || userLikes.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const likedIds = userLikes.map((like) => like.liked_id);

    // Get profiles that liked the user back (mutual)
    const { data: mutualLikes, error: mutualLikesError } = await supabase
      .from("likes")
      .select("liker_id")
      .eq("liked_id", userId)
      .in("liker_id", likedIds);

    if (mutualLikesError) {
      console.error("Error fetching mutual likes:", mutualLikesError);
      return NextResponse.json(
        { error: "Failed to fetch mutual likes" },
        { status: 500 },
      );
    }

    if (!mutualLikes || mutualLikes.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const matchIds = mutualLikes.map((like) => like.liker_id);

    // Filter to only include users from the same organization
    let profileQuery = supabase
      .from("profiles")
      .select("user_id")
      .in("user_id", matchIds)
      .is("deleted_at", null);

    if (orgId) {
      profileQuery = profileQuery.eq("organization_id", orgId);
    } else {
      profileQuery = profileQuery.is("organization_id", null);
    }

    const { data: orgProfiles, error: orgError } = await profileQuery;

    if (orgError) {
      console.error("Error filtering by org:", orgError);
      return NextResponse.json(
        { error: "Failed to filter matches" },
        { status: 500 },
      );
    }

    const orgMatchIds = orgProfiles?.map((p) => p.user_id) ?? [];

    return NextResponse.json({ matches: orgMatchIds });
  } catch (error) {
    console.error("Error in mutual likes API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
