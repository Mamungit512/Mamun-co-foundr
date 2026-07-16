import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: invite, error: inviteErr } = await supabase
      .from("cofounder_invites")
      .select("id, inviter_user_id, status")
      .eq("token", token)
      .single();

    if (inviteErr || !invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }
    if (invite.inviter_user_id !== userId) {
      return NextResponse.json({ error: "Only the inviter can revoke an invite" }, { status: 403 });
    }
    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: `Invite is already ${invite.status}` },
        { status: 409 },
      );
    }

    const { error: updateErr } = await supabase
      .from("cofounder_invites")
      .update({ status: "revoked", responded_at: new Date().toISOString() })
      .eq("id", invite.id)
      .select("id")
      .single();

    if (updateErr) {
      console.error("[cofounder-invite revoke] update error:", updateErr);
      return NextResponse.json({ error: "Failed to revoke invite" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[cofounder-invite revoke] unhandled:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
