import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { candidate_user_id } = await request.json();

    if (!candidate_user_id) {
      return NextResponse.json(
        { error: "candidate_user_id is required" },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error } = await supabase
      .from("matching_queue")
      .update({ seen_at: new Date().toISOString() })
      .eq("viewer_user_id", userId)
      .eq("candidate_user_id", candidate_user_id)
      .is("seen_at", null);

    if (error) {
      console.error("Error marking profile as seen:", error);
      return NextResponse.json(
        { error: "Failed to mark profile as seen" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in profile seen API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
