import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { target_user_id } = await request.json();

    if (!target_user_id) {
      return NextResponse.json(
        { error: "target_user_id is required" },
        { status: 400 },
      );
    }

    if (userId === target_user_id) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from("profile_views")
      .upsert(
        { viewer_user_id: userId, target_user_id },
        { onConflict: "viewer_user_id,target_user_id", ignoreDuplicates: true },
      );

    if (error) {
      console.error("Error recording profile view:", error);
      return NextResponse.json(
        { error: "Failed to record profile view" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in profile-views API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
