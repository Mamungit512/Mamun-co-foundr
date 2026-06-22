import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { sendMutualMatchEmails } from "@/lib/email/emails/mutualMatch";

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

    const { toUserId } = await request.json();
    if (!toUserId) {
      return NextResponse.json({ error: "Missing toUserId" }, { status: 400 });
    }
    if (toUserId === userId) {
      return NextResponse.json(
        { error: "Cannot we-match your own profile" },
        { status: 400 },
      );
    }

    const supabase = supa();

    const { data: fromProfile, error: fromErr } = await supabase
      .from("profiles")
      .select("user_id, organization_id, first_name, last_name")
      .eq("user_id", userId)
      .single();

    if (fromErr || !fromProfile) {
      return NextResponse.json(
        { error: "Caller profile not found" },
        { status: 404 },
      );
    }
    if (!fromProfile.organization_id) {
      return NextResponse.json(
        { error: "We Match is only available for school-org users" },
        { status: 403 },
      );
    }

    const { data: toProfile, error: toErr } = await supabase
      .from("profiles")
      .select("user_id, organization_id")
      .eq("user_id", toUserId)
      .single();

    if (toErr || !toProfile) {
      return NextResponse.json(
        { error: "Target profile not found" },
        { status: 404 },
      );
    }
    if (toProfile.organization_id !== fromProfile.organization_id) {
      return NextResponse.json(
        { error: "Cross-org match not allowed" },
        { status: 403 },
      );
    }

    const orgId = fromProfile.organization_id;

    const { error: insertErr } = await supabase
      .from("match_intents")
      .upsert(
        {
          from_user_id: userId,
          to_user_id: toUserId,
          organization_id: orgId,
        },
        { onConflict: "from_user_id,to_user_id", ignoreDuplicates: true },
      );

    if (insertErr) {
      console.error("[we-match] insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to record match intent" },
        { status: 500 },
      );
    }

    const { data: mutual, error: mutualErr } = await supabase
      .from("match_intents")
      .select("id, we_match_notified_at")
      .eq("from_user_id", toUserId)
      .eq("to_user_id", userId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (mutualErr) {
      console.error("[we-match] mutual check error:", mutualErr);
      return NextResponse.json(
        { error: "Failed to check mutual" },
        { status: 500 },
      );
    }

    if (!mutual) {
      return NextResponse.json({ success: true, mutual: false });
    }

    if (mutual.we_match_notified_at) {
      return NextResponse.json({ success: true, mutual: true, alreadyNotified: true });
    }

    await sendMutualMatchEmails({
      supabase,
      orgId,
      userAId: userId,
      userBId: toUserId,
    });

    const { error: markErr } = await supabase
      .from("match_intents")
      .update({ we_match_notified_at: new Date().toISOString() })
      .eq("organization_id", orgId)
      .or(
        `and(from_user_id.eq.${userId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${userId})`,
      );

    if (markErr) {
      console.error("[we-match] mark notified error:", markErr);
    }

    return NextResponse.json({ success: true, mutual: true });
  } catch (error) {
    console.error("[we-match] unhandled:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supa();
    const { data, error } = await supabase
      .from("match_intents")
      .select("to_user_id, we_match_notified_at")
      .eq("from_user_id", userId);

    if (error) {
      console.error("[we-match GET] error:", error);
      return NextResponse.json(
        { error: "Failed to load match intents" },
        { status: 500 },
      );
    }

    const sent = data?.map((r) => r.to_user_id) ?? [];
    const mutualNotified = data
      ?.filter((r) => r.we_match_notified_at)
      .map((r) => r.to_user_id) ?? [];

    return NextResponse.json({ sent, mutualNotified });
  } catch (error) {
    console.error("[we-match GET] unhandled:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

