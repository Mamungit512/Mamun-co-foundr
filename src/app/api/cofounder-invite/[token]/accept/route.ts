import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { sendCofounderLinkedEmail } from "@/lib/email/emails/cofounderInvite";

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
      .select("id, inviter_user_id, organization_id, invitee_email, status, expires_at")
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
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from("cofounder_invites")
        .update({ status: "expired" })
        .eq("id", invite.id);
      return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
    }
    if (invite.inviter_user_id === userId) {
      return NextResponse.json({ error: "Cannot accept your own invite" }, { status: 400 });
    }

    // Acceptor must belong to the same org as the invite
    const { data: acceptorProfile } = await supabase
      .from("profiles")
      .select("organization_id, first_name, last_name")
      .eq("user_id", userId)
      .single();

    if (!acceptorProfile) {
      return NextResponse.json({ error: "Acceptor profile not found" }, { status: 404 });
    }
    if (acceptorProfile.organization_id !== invite.organization_id) {
      return NextResponse.json(
        { error: "You must belong to the same organization to accept this invite" },
        { status: 403 },
      );
    }

    // Prevent duplicate links
    const [userA, userB] = [invite.inviter_user_id, userId].sort();
    const { data: existingLink } = await supabase
      .from("cofounder_links")
      .select("id")
      .eq("user_a_id", userA)
      .eq("user_b_id", userB)
      .maybeSingle();

    if (existingLink) {
      // Mark invite accepted even if link already exists (idempotent)
      await supabase
        .from("cofounder_invites")
        .update({ status: "accepted", invitee_user_id: userId, responded_at: new Date().toISOString() })
        .eq("id", invite.id);
      return NextResponse.json({ success: true, alreadyLinked: true });
    }

    // Insert canonical link row
    const { error: linkErr } = await supabase.from("cofounder_links").insert({
      user_a_id: userA,
      user_b_id: userB,
      organization_id: invite.organization_id,
      source_invite_id: invite.id,
    });

    if (linkErr) {
      console.error("[cofounder-invite accept] link insert error:", linkErr);
      return NextResponse.json({ error: "Failed to create co-founder link" }, { status: 500 });
    }

    await supabase
      .from("cofounder_invites")
      .update({ status: "accepted", invitee_user_id: userId, responded_at: new Date().toISOString() })
      .eq("id", invite.id);

    // Send confirmation emails to both parties
    const { data: orgRow } = await supabase
      .from("organizations")
      .select("slug")
      .eq("id", invite.organization_id)
      .single();

    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", invite.inviter_user_id)
      .single();

    if (orgRow?.slug) {
      const clerk = await clerkClient();
      const [inviterClerk, acceptorClerk] = await Promise.all([
        clerk.users.getUser(invite.inviter_user_id),
        clerk.users.getUser(userId),
      ]);
      const inviterEmail = inviterClerk.emailAddresses[0]?.emailAddress;
      const acceptorEmail = acceptorClerk.emailAddresses[0]?.emailAddress;
      const inviterName =
        [inviterProfile?.first_name, inviterProfile?.last_name].filter(Boolean).join(" ") || "Your co-founder";
      const acceptorName =
        [acceptorProfile.first_name, acceptorProfile.last_name].filter(Boolean).join(" ") || "Your co-founder";

      await Promise.allSettled([
        inviterEmail
          ? sendCofounderLinkedEmail({ to: inviterEmail, linkedName: acceptorName, slug: orgRow.slug })
          : Promise.resolve(),
        acceptorEmail
          ? sendCofounderLinkedEmail({ to: acceptorEmail, linkedName: inviterName, slug: orgRow.slug })
          : Promise.resolve(),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[cofounder-invite accept] unhandled:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
