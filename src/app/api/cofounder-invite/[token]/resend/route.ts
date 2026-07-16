import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { sendCofounderInviteEmail } from "@/lib/email/emails/cofounderInvite";

const RESEND_COOLDOWN_MS = 60 * 1000;

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
      .select("id, inviter_user_id, organization_id, status, invitee_email, notified_at")
      .eq("token", token)
      .single();

    if (inviteErr || !invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }
    if (invite.inviter_user_id !== userId) {
      return NextResponse.json({ error: "Only the inviter can resend an invite" }, { status: 403 });
    }
    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: `Invite is already ${invite.status}` },
        { status: 409 },
      );
    }
    if (
      invite.notified_at &&
      Date.now() - new Date(invite.notified_at).getTime() < RESEND_COOLDOWN_MS
    ) {
      return NextResponse.json(
        { error: "Just sent. Wait a moment before resending." },
        { status: 429 },
      );
    }

    const { data: inviterProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", userId)
      .single();

    if (profileErr || !inviterProfile) {
      return NextResponse.json({ error: "Caller profile not found" }, { status: 404 });
    }

    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("slug")
      .eq("id", invite.organization_id)
      .single();

    if (orgErr || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const inviterName =
      [inviterProfile.first_name, inviterProfile.last_name]
        .filter(Boolean)
        .join(" ") || "Someone";

    const emailResult = await sendCofounderInviteEmail({
      to: invite.invitee_email,
      inviterName,
      slug: org.slug,
      token,
    });

    if (!emailResult.ok) {
      return NextResponse.json({ error: "Failed to send invite email" }, { status: 500 });
    }

    const { error: updateErr } = await supabase
      .from("cofounder_invites")
      .update({
        notified_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", invite.id)
      .select("id")
      .single();

    if (updateErr) {
      console.error("[cofounder-invite resend] update error:", updateErr);
      return NextResponse.json({ error: "Failed to update invite" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[cofounder-invite resend] unhandled:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
