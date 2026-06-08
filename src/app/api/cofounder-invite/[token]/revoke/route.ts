import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

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
    const supabase = supa();

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

    await supabase
      .from("cofounder_invites")
      .update({ status: "revoked", responded_at: new Date().toISOString() })
      .eq("id", invite.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[cofounder-invite revoke] unhandled:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
