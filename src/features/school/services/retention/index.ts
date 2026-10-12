import { createClient } from "@supabase/supabase-js";
import { getOrgAdminEmails } from "@/features/school/auth/org-admin";
import {
  fetchEmailsById,
  fetchProfileOwners,
  getDomainRecords,
  hashEmail,
  toAccounts,
  CLERK_CACHE_SECONDS,
} from "./clerkAccounts";
import {
  monthlySeries,
  reconcile,
  splitAccounts,
  type CompletedProfile,
  type MonthlyPoint,
  type Reconciliation,
  type SchoolAccount,
} from "./reconcile";

// The only module that joins Clerk to Supabase for retention numbers.
// Every function takes orgId first; the org always comes from requireOrgAdmin().

const PAGE = 1000;

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

type Db = ReturnType<typeof supabase>;

export type ConnectionCounts = {
  connections: number;
  students_connected: number;
  messages: number;
};

export type Freshness = { fetchedAt: string; staleAfterSeconds: number };

export type RetentionOverview = {
  reconciliation: Reconciliation;
  monthlySeries: MonthlyPoint[];
  connections: ConnectionCounts;
  freshness: Freshness;
};

export type GhostRow = {
  clerk_user_id: string;
  masked_email: string;
  clerk_created_at: string;
  days_since_created: number;
  has_main_site_profile: boolean;
};

async function selectAll<T>(
  run: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await run(from, from + PAGE - 1);
    if (error) throw new Error("Failed to load retention data");
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

async function loadOrgDomains(db: Db, orgId: string): Promise<string[]> {
  const { data, error } = await db
    .from("organizations")
    .select("allowed_email_domains")
    .eq("id", orgId)
    .single();
  if (error || !data) throw new Error("Organization not found");
  return (data.allowed_email_domains as string[] | null) ?? [];
}

async function loadCompletedProfiles(
  db: Db,
  orgId: string,
): Promise<CompletedProfile[]> {
  const schoolRows = await selectAll<{ user_id: string; created_at: string }>(
    (from, to) =>
      db
        .from("school_profiles")
        .select("user_id, created_at")
        .eq("organization_id", orgId)
        .order("id")
        .range(from, to),
  );
  if (schoolRows.length === 0) return [];

  // Completed means the base profile row also exists and is not deleted.
  const live = new Set<string>();
  const ids = schoolRows.map((r) => r.user_id);
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await db
      .from("profiles")
      .select("user_id")
      .in("user_id", ids.slice(i, i + 200))
      .is("deleted_at", null);
    if (error) throw new Error("Failed to load retention data");
    for (const r of data ?? []) live.add(r.user_id);
  }
  return schoolRows
    .filter((r) => live.has(r.user_id))
    .map((r) => ({ userId: r.user_id, completedAt: r.created_at }));
}

async function loadLegacyTotal(db: Db, orgId: string): Promise<number> {
  const { count, error } = await db
    .from("profiles")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .is("deleted_at", null);
  if (error) throw new Error("Failed to load retention data");
  return count ?? 0;
}

type Loaded = {
  db: Db;
  accounts: SchoolAccount[];
  completed: CompletedProfile[];
  fetchedAt: string;
};

async function load(orgId: string): Promise<Loaded> {
  const db = supabase();
  const [domains, completed, staffEmails] = await Promise.all([
    loadOrgDomains(db, orgId),
    loadCompletedProfiles(db, orgId),
    getOrgAdminEmails(orgId),
  ]);
  const { records, fetchedAt } = await getDomainRecords(orgId, domains);

  // A school profile attributes its owner even when their email is off-domain.
  const known = new Set(records.map((r) => r.id));
  const extra = await fetchProfileOwners(
    completed.map((p) => p.userId).filter((id) => !known.has(id)),
  );

  const staffHashes = new Set(staffEmails.map(hashEmail));
  return {
    db,
    accounts: toAccounts([...records, ...extra], staffHashes),
    completed,
    fetchedAt,
  };
}

async function loadConnections(
  db: Db,
  completedIds: Set<string>,
  reconciledIds: Set<string>,
): Promise<ConnectionCounts> {
  const empty = { connections: 0, students_connected: 0, messages: 0 };
  if (completedIds.size === 0) return empty;

  const candidates = new Set<string>();
  const ids = [...completedIds];
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await db
      .from("conversation_participants")
      .select("conversation_id")
      .in("user_id", ids.slice(i, i + 200));
    if (error) throw new Error("Failed to load retention data");
    for (const r of data ?? []) candidates.add(r.conversation_id);
  }

  const participants = new Map<string, string[]>();
  const convIds = [...candidates];
  for (let i = 0; i < convIds.length; i += 200) {
    const { data, error } = await db
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", convIds.slice(i, i + 200));
    if (error) throw new Error("Failed to load retention data");
    for (const r of data ?? []) {
      const list = participants.get(r.conversation_id) ?? [];
      list.push(r.user_id);
      participants.set(r.conversation_id, list);
    }
  }

  // A connection is a two-person conversation where both have completed profiles.
  const pairConvs = [...participants.entries()].filter(
    ([, users]) =>
      users.length === 2 && users.every((u) => completedIds.has(u)),
  );

  const withMessages = new Set<string>();
  let messages = 0;
  const pairIds = pairConvs.map(([id]) => id);
  for (let i = 0; i < pairIds.length; i += 100) {
    const chunk = pairIds.slice(i, i + 100);
    const rows = await selectAll<{ conversation_id: string }>((from, to) =>
      db
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", chunk)
        .order("id")
        .range(from, to),
    );
    for (const r of rows) withMessages.add(r.conversation_id);
    messages += rows.length;
  }

  const connected = new Set<string>();
  for (const [id, users] of pairConvs) {
    if (!withMessages.has(id)) continue;
    for (const u of users) if (reconciledIds.has(u)) connected.add(u);
  }
  return {
    connections: withMessages.size,
    students_connected: connected.size,
    messages,
  };
}

export async function getOverview(orgId: string): Promise<RetentionOverview> {
  const { db, accounts, completed, fetchedAt } = await load(orgId);
  const legacy = await loadLegacyTotal(db, orgId);
  const split = splitAccounts(accounts, completed);
  const connections = await loadConnections(
    db,
    new Set(split.completed.map((p) => p.userId)),
    split.reconciledIds,
  );
  return {
    reconciliation: reconcile(accounts, completed, legacy),
    monthlySeries: monthlySeries(accounts, completed),
    connections,
    freshness: { fetchedAt, staleAfterSeconds: CLERK_CACHE_SECONDS },
  };
}

async function ghostsOldestFirst(orgId: string) {
  const { db, accounts, completed } = await load(orgId);
  const { ghosts } = splitAccounts(accounts, completed);
  return {
    db,
    ghosts: [...ghosts].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

export async function getGhostAccounts(
  orgId: string,
  limit: number,
  offset: number,
): Promise<{ rows: GhostRow[]; total: number }> {
  const { db, ghosts } = await ghostsOldestFirst(orgId);
  const page = ghosts.slice(offset, offset + limit);

  const withProfile = new Set<string>();
  for (let i = 0; i < page.length; i += 200) {
    const { data, error } = await db
      .from("profiles")
      .select("user_id")
      .in(
        "user_id",
        page.slice(i, i + 200).map((g) => g.id),
      )
      .is("deleted_at", null);
    if (error) throw new Error("Failed to load retention data");
    for (const r of data ?? []) withProfile.add(r.user_id);
  }

  const now = Date.now();
  return {
    total: ghosts.length,
    rows: page.map((g) => ({
      clerk_user_id: g.id,
      masked_email: g.maskedEmail,
      clerk_created_at: g.createdAt,
      days_since_created: Math.floor(
        (now - new Date(g.createdAt).getTime()) / 86_400_000,
      ),
      has_main_site_profile: withProfile.has(g.id),
    })),
  };
}

// Full emails, fetched live and never cached. For the Sources CSV export only.
export async function getGhostExportRows(
  orgId: string,
): Promise<(GhostRow & { email: string })[]> {
  const { rows } = await getGhostAccounts(orgId, Number.MAX_SAFE_INTEGER, 0);
  const emails = await fetchEmailsById(rows.map((r) => r.clerk_user_id));
  return rows.map((r) => ({ ...r, email: emails.get(r.clerk_user_id) ?? "" }));
}
