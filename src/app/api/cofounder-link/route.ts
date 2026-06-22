import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

// Either party can unlink the pair
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { linkId } = await request.json();
    if (!linkId) {
      return NextResponse.json({ error: "Missing linkId" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    const { data: link } = await supabase
      .from("cofounder_links")
      .select("id, user_a_id, user_b_id")
      .eq("id", linkId)
      .single();

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    if (link.user_a_id !== userId && link.user_b_id !== userId) {
      return NextResponse.json(
        { error: "You are not a member of this co-founder link" },
        { status: 403 },
      );
    }

    await supabase.from("cofounder_links").delete().eq("id", linkId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[cofounder-link DELETE] unhandled:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
