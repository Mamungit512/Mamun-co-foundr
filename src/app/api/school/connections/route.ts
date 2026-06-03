import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireOrgAdmin } from "@/lib/auth/org-admin";

export type OrgConnection = {
  conversation_id: string;
  user1: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    title: string | null;
  };
  user2: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    title: string | null;
  };
  message_count: number;
  created_at: string;
  last_message_at: string | null;
};

export async function GET() {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;
  const { orgId } = auth;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 1. Get all user IDs in the org
  const { data: orgProfiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("organization_id", orgId)
    .is("deleted_at", null);

  if (profilesError) {
    return NextResponse.json(
      { error: "Failed to fetch org profiles" },
      { status: 500 },
    );
  }

  const orgUserIds = new Set((orgProfiles ?? []).map((p) => p.user_id));
  if (orgUserIds.size === 0) {
    return NextResponse.json({ connections: [], total_connections: 0 });
  }

  // 2. Get conversation IDs where an org user is a participant
  const { data: orgParticipants } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .in("user_id", [...orgUserIds]);

  const candidateConvIds = [
    ...new Set((orgParticipants ?? []).map((r) => r.conversation_id)),
  ];
  if (candidateConvIds.length === 0) {
    return NextResponse.json({ connections: [], total_connections: 0 });
  }

  // 3. Get all participants for those conversations
  const { data: allParticipants } = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_id")
    .in("conversation_id", candidateConvIds);

  // 4. Keep only conversations where every participant belongs to the org
  const convMap = new Map<string, string[]>();
  for (const row of allParticipants ?? []) {
    const arr = convMap.get(row.conversation_id) ?? [];
    arr.push(row.user_id);
    convMap.set(row.conversation_id, arr);
  }

  const orgConvIds = [...convMap.entries()]
    .filter(([, participants]) =>
      participants.every((uid) => orgUserIds.has(uid)),
    )
    .map(([id]) => id);

  if (orgConvIds.length === 0) {
    return NextResponse.json({ connections: [], total_connections: 0 });
  }

  // 5. Get conversation details
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, created_at, last_message_at")
    .in("id", orgConvIds)
    .order("created_at", { ascending: false });

  // 6. Get message counts in one query
  const { data: messageCounts } = await supabase
    .from("messages")
    .select("conversation_id")
    .in("conversation_id", orgConvIds);

  const msgCountMap = new Map<string, number>();
  for (const row of messageCounts ?? []) {
    msgCountMap.set(
      row.conversation_id,
      (msgCountMap.get(row.conversation_id) ?? 0) + 1,
    );
  }

  // 7. Gather all participant user IDs and fetch profiles in one query
  const allParticipantIds = [...new Set([...orgUserIds])];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, first_name, last_name, title")
    .in("user_id", allParticipantIds);

  const profilesMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, p]),
  );

  const connections: OrgConnection[] = [];
  for (const conv of conversations ?? []) {
    const count = msgCountMap.get(conv.id) ?? 0;
    if (count === 0) continue;

    const participants = convMap.get(conv.id) ?? [];
    if (participants.length !== 2) continue;

    const p1 = profilesMap.get(participants[0]);
    const p2 = profilesMap.get(participants[1]);
    if (!p1 || !p2) continue;

    connections.push({
      conversation_id: conv.id,
      user1: {
        user_id: p1.user_id,
        first_name: p1.first_name,
        last_name: p1.last_name,
        title: p1.title,
      },
      user2: {
        user_id: p2.user_id,
        first_name: p2.first_name,
        last_name: p2.last_name,
        title: p2.title,
      },
      message_count: count,
      created_at: conv.created_at,
      last_message_at: conv.last_message_at,
    });
  }

  return NextResponse.json({
    connections,
    total_connections: connections.length,
  });
}
