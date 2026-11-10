import { createClient } from "@supabase/supabase-js";
import { isValidClerkUserId } from "@/lib/validation";
import type { ProposalLocation } from "../rules";
import type { MeetupDto, MeetupLocationOption } from "../types";

/**
 * Service-role data access for meetups. Server-only: the tables have RLS on
 * with no policies, so this is the only way in. Callers must already have
 * checked the flag and the caller's school/pair membership.
 *
 * Never log a row's `note`.
 */

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string =>
  typeof v === "string" && UUID_RE.test(v);

// Email-claim columns are deliberately not selected.
const MEETUP_SELECT =
  "id, organization_id, proposer_user_id, recipient_user_id, starts_at, note, status, responded_at, created_at, " +
  "location:meetup_locations!meetups_location_same_org_fkey(id, name, building, is_active)";

type MeetupRow = {
  id: string;
  organization_id: string;
  proposer_user_id: string;
  recipient_user_id: string;
  starts_at: string;
  note: string | null;
  status: MeetupDto["status"];
  responded_at: string | null;
  created_at: string;
  location: {
    id: string;
    name: string;
    building: string | null;
    is_active: boolean;
  };
};

function toDto(row: MeetupRow): MeetupDto {
  return {
    id: row.id,
    status: row.status,
    proposerUserId: row.proposer_user_id,
    recipientUserId: row.recipient_user_id,
    startsAt: new Date(row.starts_at).toISOString(),
    note: row.note,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
    location: {
      id: row.location.id,
      name: row.location.name,
      building: row.location.building,
      isActive: row.location.is_active,
    },
  };
}

/** The school's slug, or null if the org is missing. Never throws. */
export async function getOrgSlugById(orgId: string): Promise<string | null> {
  const { data } = await supabase()
    .from("organizations")
    .select("slug")
    .eq("id", orgId)
    .maybeSingle();
  return (data?.slug as string | undefined) ?? null;
}

/** Mutual We Match: an intent row in each direction, both in this school. */
export async function isMutualMatch(
  orgId: string,
  userA: string,
  userB: string,
): Promise<boolean> {
  // The ids go into a raw PostgREST filter, which does no escaping of its own.
  if (!isValidClerkUserId(userA) || !isValidClerkUserId(userB)) return false;
  const { data, error } = await supabase()
    .from("match_intents")
    .select("from_user_id, to_user_id")
    .eq("organization_id", orgId)
    .or(
      `and(from_user_id.eq.${userA},to_user_id.eq.${userB}),and(from_user_id.eq.${userB},to_user_id.eq.${userA})`,
    );
  if (error) throw new Error("match lookup failed");
  const rows = data ?? [];
  const aToB = rows.some((r) => r.from_user_id === userA && r.to_user_id === userB);
  const bToA = rows.some((r) => r.from_user_id === userB && r.to_user_id === userA);
  return aToB && bToA;
}

export async function listActiveLocations(
  orgId: string,
): Promise<MeetupLocationOption[]> {
  const { data, error } = await supabase()
    .from("meetup_locations")
    .select("id, name, building")
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw new Error("locations lookup failed");
  return (data ?? []) as MeetupLocationOption[];
}

/** The row for a location id (active or not), shaped for the rules module. */
export async function getLocationForProposal(
  locationId: string,
): Promise<ProposalLocation | null> {
  if (!isUuid(locationId)) return null;
  const { data, error } = await supabase()
    .from("meetup_locations")
    .select("id, organization_id, is_active")
    .eq("id", locationId)
    .maybeSingle();
  if (error) throw new Error("location lookup failed");
  if (!data) return null;
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    isActive: data.is_active as boolean,
  };
}

/** Latest meetup for the pair, in either direction, scoped to this school. */
export async function getLatestMeetupForPair(
  orgId: string,
  userA: string,
  userB: string,
): Promise<MeetupDto | null> {
  const [lo, hi] = [userA, userB].sort();
  const { data, error } = await supabase()
    .from("meetups")
    .select(MEETUP_SELECT)
    .eq("organization_id", orgId)
    .eq("pair_key", `${lo}:${hi}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("meetup lookup failed");
  return data ? toDto(data as unknown as MeetupRow) : null;
}

export type MeetupParties = {
  id: string;
  organizationId: string;
  proposerUserId: string;
  recipientUserId: string;
  status: MeetupDto["status"];
};

export async function getMeetupParties(id: string): Promise<MeetupParties | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await supabase()
    .from("meetups")
    .select("id, organization_id, proposer_user_id, recipient_user_id, status")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("meetup lookup failed");
  if (!data) return null;
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    proposerUserId: data.proposer_user_id as string,
    recipientUserId: data.recipient_user_id as string,
    status: data.status as MeetupDto["status"],
  };
}

export type InsertMeetupResult =
  | { ok: true; meetup: MeetupDto }
  | { ok: false; reason: "open_exists" };

/**
 * Insert a proposal. The partial unique index on (pair_key) WHERE
 * status='proposed' is what enforces "one open meetup per pair"; a unique
 * violation (23505) is reported as `open_exists`.
 */
export async function insertMeetup(row: {
  orgId: string;
  proposerUserId: string;
  recipientUserId: string;
  locationId: string;
  startsAt: Date;
  note: string | null;
}): Promise<InsertMeetupResult> {
  const { data, error } = await supabase()
    .from("meetups")
    .insert({
      organization_id: row.orgId,
      proposer_user_id: row.proposerUserId,
      recipient_user_id: row.recipientUserId,
      location_id: row.locationId,
      starts_at: row.startsAt.toISOString(),
      note: row.note,
    })
    .select(MEETUP_SELECT)
    .single();
  if (error) {
    if (error.code === "23505") return { ok: false, reason: "open_exists" };
    // Log the code only: the error object can echo the failing row, note included.
    console.error("[meetups] insert failed:", error.code);
    throw new Error("meetup insert failed");
  }
  return { ok: true, meetup: toDto(data as unknown as MeetupRow) };
}

/**
 * Answer a proposal atomically: only flips a row that is still 'proposed' and
 * addressed to this user, so a double accept (or accept racing decline) updates
 * nothing the second time. Returns null when no row matched.
 */
export async function respondToMeetup(
  id: string,
  recipientUserId: string,
  status: "accepted" | "declined",
): Promise<MeetupDto | null> {
  const { data, error } = await supabase()
    .from("meetups")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "proposed")
    .eq("recipient_user_id", recipientUserId)
    .select(MEETUP_SELECT)
    .maybeSingle();
  if (error) {
    console.error("[meetups] respond failed:", error.code);
    throw new Error("meetup update failed");
  }
  return data ? toDto(data as unknown as MeetupRow) : null;
}
