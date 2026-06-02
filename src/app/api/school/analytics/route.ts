import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireOrgAdmin } from "@/lib/auth/org-admin";

export async function GET() {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;
  const { orgId } = auth;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 1. Total signups + technical split
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, is_technical")
    .eq("organization_id", orgId)
    .is("deleted_at", null);

  if (profilesError) {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }

  const orgProfiles = profiles ?? [];
  const totalSignups = orgProfiles.length;
  const technicalCount = orgProfiles.filter((p) => p.is_technical).length;
  const nonTechnicalCount = totalSignups - technicalCount;
  const orgUserIds = orgProfiles.map((p) => p.user_id);

  // 2. Active last 7 days (via user_activity_summary)
  let activeCount = 0;
  if (orgUserIds.length > 0) {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const { count } = await supabase
      .from("user_activity_summary")
      .select("user_id", { count: "exact", head: true })
      .in("user_id", orgUserIds)
      .gte("last_active_at", sevenDaysAgo);
    activeCount = count ?? 0;
  }

  // 3. Total connections (org-scoped conversations with at least 1 message)
  let totalConnections = 0;
  let totalMessages = 0;
  if (orgUserIds.length > 0) {
    const { data: orgParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .in("user_id", orgUserIds);

    const candidateConvIds = [
      ...new Set((orgParticipants ?? []).map((r) => r.conversation_id)),
    ];

    if (candidateConvIds.length > 0) {
      const orgUserSet = new Set(orgUserIds);
      const { data: allParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", candidateConvIds);

      const convMap = new Map<string, string[]>();
      for (const row of allParticipants ?? []) {
        const arr = convMap.get(row.conversation_id) ?? [];
        arr.push(row.user_id);
        convMap.set(row.conversation_id, arr);
      }

      const orgConvIds = [...convMap.entries()]
        .filter(([, participants]) =>
          participants.every((uid) => orgUserSet.has(uid)),
        )
        .map(([id]) => id);

      if (orgConvIds.length > 0) {
        const { count: msgCount } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .in("conversation_id", orgConvIds);

        // Count conversations that have at least 1 message
        const { data: msgsPerConv } = await supabase
          .from("messages")
          .select("conversation_id")
          .in("conversation_id", orgConvIds);

        const convsWithMessages = new Set(
          (msgsPerConv ?? []).map((r) => r.conversation_id),
        );
        totalConnections = convsWithMessages.size;
        totalMessages = msgCount ?? 0;
      }
    }
  }

  return NextResponse.json({
    total_signups: totalSignups,
    active_last_7_days: activeCount,
    technical_count: technicalCount,
    non_technical_count: nonTechnicalCount,
    total_connections: totalConnections,
    total_messages: totalMessages,
  });
}
