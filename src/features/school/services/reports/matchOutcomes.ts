import { createClient } from "@supabase/supabase-js";
import { toCsv } from "@/lib/csv";

type IntentRow = {
  from_user_id: string;
  to_user_id: string;
  we_match_notified_at: string | null;
  created_at: string;
};

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return "0.0%";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

export async function getMatchOutcomesCsv(orgId: string): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: intentsData, error } = await supabase
    .from("match_intents")
    .select("from_user_id, to_user_id, we_match_notified_at, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });

  if (error) throw new Error("Failed to fetch match outcomes");

  const intents = (intentsData ?? []) as IntentRow[];

  const edgeKey = (from: string, to: string) => `${from}|${to}`;
  const edges = new Set(intents.map((i) => edgeKey(i.from_user_id, i.to_user_id)));

  const totalClicks = intents.length;
  const senders = new Set(intents.map((i) => i.from_user_id));
  let reciprocatedEdges = 0;
  for (const i of intents) {
    if (edges.has(edgeKey(i.to_user_id, i.from_user_id))) reciprocatedEdges += 1;
  }
  const mutualPairs = Math.floor(reciprocatedEdges / 2);
  const oneSidedClicks = totalClicks - reciprocatedEdges;

  const userIds = [
    ...new Set(intents.flatMap((i) => [i.from_user_id, i.to_user_id])),
  ];
  const nameByUser = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", userIds);
    for (const p of profiles ?? []) {
      const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
      nameByUser.set(p.user_id, name || p.user_id);
    }
  }
  const nameOf = (userId: string) => nameByUser.get(userId) ?? userId;

  const summary: (string | number)[][] = [
    ["We Match Outcomes"],
    ["Generated", new Date().toISOString()],
    [],
    ["Metric", "Value"],
    ["Total We-Match clicks", totalClicks],
    ["Unique senders", senders.size],
    ["Mutual pairs", mutualPairs],
    ["One-sided clicks", oneSidedClicks],
    ["Mutual match rate", pct(reciprocatedEdges, totalClicks)],
    ["One-sided interest rate", pct(oneSidedClicks, totalClicks)],
    [],
  ];

  const detail: (string | number)[][] = [
    ["From", "Direction", "To", "Status", "Notified at", "Created at"],
  ];
  const seenMutual = new Set<string>();
  for (const i of intents) {
    const isMutual = edges.has(edgeKey(i.to_user_id, i.from_user_id));
    if (isMutual) {
      const pairId = [i.from_user_id, i.to_user_id].sort().join("|");
      if (seenMutual.has(pairId)) continue;
      seenMutual.add(pairId);
      detail.push([
        nameOf(i.from_user_id),
        "↔",
        nameOf(i.to_user_id),
        "mutual",
        i.we_match_notified_at ?? "—",
        i.created_at,
      ]);
    } else {
      detail.push([
        nameOf(i.from_user_id),
        "→",
        nameOf(i.to_user_id),
        "one-sided",
        "—",
        i.created_at,
      ]);
    }
  }

  return toCsv([...summary, ...detail]);
}
