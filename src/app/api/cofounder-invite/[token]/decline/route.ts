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
      .select("id, inviter_user_id, organization_id, invitee_email, status")
      .eq("token", token)
      .single();

    if (inviteErr || !invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }
    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: `Invite is already ${invite.status}` },
        { status: 409 },
      );
    }
    if (invite.inviter_user_id === userId) {
      return NextResponse.json({ error: "Cannot decline your own invite — use revoke instead" }, { status: 400 });
    }

    // Verify acceptor's org matches (same defense-in-depth as accept)
    const { data: acceptorProfile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("user_id", userId)
      .single();

    if (acceptorProfile?.organization_id !== invite.organization_id) {
      return NextResponse.json(
        { error: "You must belong to the same organization to decline this invite" },
        { status: 403 },
      );
    }

    await supabase
      .from("cofounder_invites")
      .update({ status: "declined", invitee_user_id: userId, responded_at: new Date().toISOString() })
      .eq("id", invite.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[cofounder-invite decline] unhandled:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
