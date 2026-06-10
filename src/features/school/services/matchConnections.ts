import { createClient } from "@supabase/supabase-js";

export type MatchKind = "linked" | "mutual" | "pending";

export type MatchPerson = {
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  is_technical: boolean | null;
  email?: string | null;
};

export type MatchConnection = {
  id: string;
  kind: MatchKind;
  pending_source?: "intent" | "invite";
  person1: MatchPerson;
  person2: MatchPerson;
  matched_at: string;
};

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join(":");
}

export async function getMatchConnections(
  orgId: string,
): Promise<MatchConnection[]> {
  const supabase = supabaseAdmin();

  // 1. Fetch all active org profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, first_name, last_name, title, is_technical")
    .eq("organization_id", orgId)
    .is("deleted_at", null);

  if (profilesError) throw new Error("Failed to fetch org profiles");

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.user_id as string, p]),
  );

  // 2. Fetch cofounder_links for org
  const { data: links } = await supabase
    .from("cofounder_links")
    .select("id, user_a_id, user_b_id, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  // 3. Fetch match_intents for org
  const { data: intents } = await supabase
    .from("match_intents")
    .select("id, from_user_id, to_user_id, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  // 4. Fetch pending cofounder_invites for org
  const { data: invites } = await supabase
    .from("cofounder_invites")
    .select(
      "id, inviter_user_id, invitee_email, invitee_user_id, created_at",
    )
    .eq("organization_id", orgId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const results: MatchConnection[] = [];
  const seen = new Set<string>();

  // Helper: resolve a person from the profile map
  const toPerson = (userId: string): MatchPerson | null => {
    const p = profileMap.get(userId);
    if (!p) return null;
    return {
      user_id: p.user_id,
      first_name: p.first_name,
      last_name: p.last_name,
      title: p.title,
      is_technical: p.is_technical,
    };
  };

  // --- Linked (highest precedence) ---
  for (const link of links ?? []) {
    const key = pairKey(link.user_a_id, link.user_b_id);
    if (seen.has(key)) continue;
    const p1 = toPerson(link.user_a_id);
    const p2 = toPerson(link.user_b_id);
    if (!p1 || !p2) continue;
    seen.add(key);
    results.push({
      id: `linked:${key}`,
      kind: "linked",
      person1: p1,
      person2: p2,
      matched_at: link.created_at,
    });
  }

  // --- Mutual Match ---
  // Group intents by canonical pair key; a pair with both directions = mutual
  const intentsByPair = new Map<string, { at: string; fromA: boolean }[]>();
  for (const intent of intents ?? []) {
    const key = pairKey(intent.from_user_id, intent.to_user_id);
    const arr = intentsByPair.get(key) ?? [];
    arr.push({
      at: intent.created_at,
      fromA: intent.from_user_id < intent.to_user_id,
    });
    intentsByPair.set(key, arr);
  }

  const oneWayIntents: string[] = [];

  for (const [key, entries] of intentsByPair) {
    if (seen.has(key)) continue;
    if (entries.length >= 2) {
      // mutual
      const [a, b] = key.split(":");
      const p1 = toPerson(a);
      const p2 = toPerson(b);
      if (!p1 || !p2) continue;
      const latestAt = entries.reduce(
        (max, e) => (e.at > max ? e.at : max),
        entries[0].at,
      );
      seen.add(key);
      results.push({
        id: `mutual:${key}`,
        kind: "mutual",
        person1: p1,
        person2: p2,
        matched_at: latestAt,
      });
    } else {
      oneWayIntents.push(key);
    }
  }

  // --- Pending: one-sided intents ---
  for (const intent of intents ?? []) {
    const key = pairKey(intent.from_user_id, intent.to_user_id);
    if (seen.has(key)) continue;
    if (!oneWayIntents.includes(key)) continue;
    const p1 = toPerson(intent.from_user_id);
    const p2 = toPerson(intent.to_user_id);
    if (!p1 || !p2) continue;
    seen.add(key);
    results.push({
      id: `pending-intent:${key}`,
      kind: "pending",
      pending_source: "intent",
      person1: p1,
      person2: p2,
      matched_at: intent.created_at,
    });
  }

  // --- Pending: cofounder invites ---
  for (const invite of invites ?? []) {
    const inviteeId = invite.invitee_user_id as string | null;
    const inviterKey = invite.inviter_user_id as string;
    if (inviteeId && seen.has(pairKey(inviterKey, inviteeId))) continue;

    const p1 = toPerson(inviterKey);
    if (!p1) continue;

    let p2: MatchPerson;
    if (inviteeId) {
      const resolved = toPerson(inviteeId);
      if (!resolved) continue;
      p2 = resolved;
      seen.add(pairKey(inviterKey, inviteeId));
    } else {
      // email-only invitee
      p2 = {
        user_id: null,
        first_name: null,
        last_name: null,
        title: null,
        is_technical: null,
        email: invite.invitee_email as string,
      };
    }

    results.push({
      id: `pending-invite:${invite.id}`,
      kind: "pending",
      pending_source: "invite",
      person1: p1,
      person2: p2,
      matched_at: invite.created_at,
    });
  }

  // Sort by matched_at descending
  return results.sort((a, b) =>
    a.matched_at < b.matched_at ? 1 : a.matched_at > b.matched_at ? -1 : 0,
  );
}
