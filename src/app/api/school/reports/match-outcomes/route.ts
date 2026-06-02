import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireOrgAdmin } from "@/lib/auth/org-admin";
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

/**
 * We Match outcomes report (CSV) — the "core UT proof point".
 * Org-admin only, scoped to the caller's organization.
 *
 * Each row in match_intents is one directed "We Match" click (from → to). A
 * reciprocal pair (A→B and B→A) is a mutual match. We report one-sided interest
 * rate and mutual match rate, plus a per-pair breakdown.
 */
export async function GET() {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;
  const { orgId } = auth;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: intentsData, error } = await supabase
    .from("match_intents")
    .select("from_user_id, to_user_id, we_match_notified_at, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch match outcomes" },
      { status: 500 },
    );
  }

  const intents = (intentsData ?? []) as IntentRow[];

  // Directed-edge lookup for reciprocity checks
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

  // Resolve names for the per-pair detail
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

  // ── Summary block ──
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

  // ── Per-pair detail ──
  // Mutual pairs emitted once (A ↔ B); one-sided edges as A → B.
  const detail: (string | number)[][] = [
    ["From", "Direction", "To", "Status", "Notified at", "Created at"],
  ];
  const seenMutual = new Set<string>();
  for (const i of intents) {
    const isMutual = edges.has(edgeKey(i.to_user_id, i.from_user_id));
    if (isMutual) {
      // Dedupe: only emit the first-seen direction of the pair
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

  const csv = toCsv([...summary, ...detail]);
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ut-we-match-outcomes-${date}.csv"`,
    },
  });
}
