import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import { isEmailDomainAllowed } from "@/features/school/auth/email-domain";
import { sendCofounderInviteEmail } from "@/lib/email/emails/cofounderInvite";
import { randomBytes } from "crypto";

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inviteeEmail, inviteeRole, note } = await request.json();
    const normalizedEmail = (inviteeEmail ?? "").trim().toLowerCase();
    const normalizedRole = (inviteeRole ?? "").trim() || null;
    const normalizedNote = (note ?? "").trim() || null;
    if (!normalizedEmail) {
      return NextResponse.json({ error: "Missing inviteeEmail" }, { status: 400 });
    }

    const supabase = supa();

    const { data: inviterProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, organization_id")
      .eq("user_id", userId)
      .single();

    if (profileErr || !inviterProfile) {
      return NextResponse.json({ error: "Caller profile not found" }, { status: 404 });
    }
    if (!inviterProfile.organization_id) {
      return NextResponse.json(
        { error: "Co-founder invites are only available for school-org users" },
        { status: 403 },
      );
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id, slug, allowed_email_domains")
      .eq("id", inviterProfile.organization_id)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Domain gate — invitee must belong to the same school org
    if (!isEmailDomainAllowed(normalizedEmail, org.allowed_email_domains ?? [])) {
      return NextResponse.json(
        { error: "Invitee email domain is not allowed for this organization" },
        { status: 403 },
      );
    }

    // Look up invitee's Clerk account to get their user_id (if they exist)
    let inviteeUserId: string | null = null;
    const clerk = await clerkClient();
    const clerkUsers = await clerk.users.getUserList({ emailAddress: [normalizedEmail] });
    if (clerkUsers.data.length > 0) {
      inviteeUserId = clerkUsers.data[0].id;
    }

    // Self-invite check
    if (inviteeUserId === userId) {
      return NextResponse.json({ error: "Cannot invite yourself" }, { status: 400 });
    }

    // Already linked check
    if (inviteeUserId) {
      const [a, b] = [userId, inviteeUserId].sort();
      const { data: existingLink } = await supabase
        .from("cofounder_links")
        .select("id")
        .eq("user_a_id", a)
        .eq("user_b_id", b)
        .maybeSingle();

      if (existingLink) {
        return NextResponse.json(
          { error: "You are already linked as co-founders" },
          { status: 409 },
        );
      }
    }

    // One-active-link-per-user guard (v1: max one co-founder link)
    const { data: existingLinkForInviter } = await supabase
      .from("cofounder_links")
      .select("id")
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .maybeSingle();
    if (existingLinkForInviter) {
      return NextResponse.json(
        { error: "You already have a linked co-founder. Unlink first to invite someone new." },
        { status: 409 },
      );
    }

    // Pending invite already exists check (via partial unique index)
    const { data: existingInvite } = await supabase
      .from("cofounder_invites")
      .select("id")
      .eq("inviter_user_id", userId)
      .eq("status", "pending")
      .ilike("invitee_email", normalizedEmail)
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: "A pending invite already exists for this email" },
        { status: 409 },
      );
    }

    const token = randomBytes(32).toString("hex");
    const inviterName =
      [inviterProfile.first_name, inviterProfile.last_name].filter(Boolean).join(" ") || "Someone";

    const { error: insertErr } = await supabase.from("cofounder_invites").insert({
      inviter_user_id: userId,
      organization_id: inviterProfile.organization_id,
      invitee_email: normalizedEmail,
      invitee_role: normalizedRole,
      note: normalizedNote,
      invitee_user_id: inviteeUserId,
      token,
    });

    if (insertErr) {
      console.error("[cofounder-invite] insert error:", insertErr);
      return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
    }

    const emailResult = await sendCofounderInviteEmail({
      to: normalizedEmail,
      inviterName,
      slug: org.slug,
      token,
    });

    if (emailResult.ok) {
      await supabase
        .from("cofounder_invites")
        .update({ notified_at: new Date().toISOString() })
        .eq("token", token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[cofounder-invite POST] unhandled:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supa();

    const { data: invites, error: inviteErr } = await supabase
      .from("cofounder_invites")
      .select("id, token, invitee_email, invitee_role, note, status, created_at, expires_at")
      .eq("inviter_user_id", userId)
      .order("created_at", { ascending: false });

    if (inviteErr) {
      console.error("[cofounder-invite GET] invites error:", inviteErr);
      return NextResponse.json({ error: "Failed to load invites" }, { status: 500 });
    }

    const [a_sort, b_sort] = [userId, userId];
    const { data: links, error: linkErr } = await supabase
      .from("cofounder_links")
      .select("id, user_a_id, user_b_id, created_at")
      .or(`user_a_id.eq.${a_sort},user_b_id.eq.${b_sort}`);

    if (linkErr) {
      console.error("[cofounder-invite GET] links error:", linkErr);
      return NextResponse.json({ error: "Failed to load links" }, { status: 500 });
    }

    const linkedUserIds = (links ?? []).map((l) =>
      l.user_a_id === userId ? l.user_b_id : l.user_a_id,
    );

    let linkedProfiles: { user_id: string; first_name: string | null; last_name: string | null; pfp_url: string | null; title: string | null }[] = [];
    if (linkedUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, pfp_url, title")
        .in("user_id", linkedUserIds);
      linkedProfiles = profiles ?? [];
    }

    const linkedWithLinkId = (links ?? []).map((l) => {
      const partnerId = l.user_a_id === userId ? l.user_b_id : l.user_a_id;
      const profile = linkedProfiles.find((p) => p.user_id === partnerId);
      return { link_id: l.id, created_at: l.created_at, ...profile };
    });

    return NextResponse.json({
      invites: invites ?? [],
      links: linkedWithLinkId,
    });
  } catch (error) {
    console.error("[cofounder-invite GET] unhandled:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
