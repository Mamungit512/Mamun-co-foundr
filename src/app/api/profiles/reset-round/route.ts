import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from("matching_queue")
      .update({ cycle: 0, updated_at: new Date().toISOString() })
      .eq("viewer_user_id", userId);

    if (error) {
      console.error("Error resetting matching queue:", error);
      return NextResponse.json(
        { error: "Failed to reset matching queue" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in reset-round API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
