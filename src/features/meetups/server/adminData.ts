import { createClient } from "@supabase/supabase-js";
import { isDuplicateLocationName } from "../locationRules";
import type { AdminLocationDto, AdminMeetupRow } from "../adminTypes";
import { isUuid } from "./data";

/**
 * Service-role data access for the school admin's meetups screens. Every
 * function takes the admin's own orgId and never returns another school's rows.
 *
 * The meetups query selects explicit columns. The note, the email-claim
 * columns and the user ids are never selected, so they cannot reach an admin.
 */

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

type LocationRow = {
  id: string;
  name: string;
  building: string | null;
  is_active: boolean;
  created_at: string;
};
const LOCATION_SELECT = "id, name, building, is_active, created_at";

const toLocation = (r: LocationRow): AdminLocationDto => ({
  id: r.id,
  name: r.name,
  building: r.building,
  isActive: r.is_active,
  createdAt: r.created_at,
});

/** All of the school's spots, switched-off ones included. Active first. */
export async function listLocationsForAdmin(orgId: string): Promise<AdminLocationDto[]> {
  const { data, error } = await supabase()
    .from("meetup_locations")
    .select(LOCATION_SELECT)
    .eq("organization_id", orgId)
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw new Error("locations lookup failed");
  return ((data ?? []) as LocationRow[]).map(toLocation);
}

export type CreateLocationResult =
  | { ok: true; location: AdminLocationDto }
  | { ok: false; reason: "duplicate" };

export async function createLocation(
  orgId: string,
  value: { name: string; building: string | null },
): Promise<CreateLocationResult> {
  const existing = await listLocationsForAdmin(orgId);
  if (isDuplicateLocationName(value.name, existing.map((l) => l.name))) {
    return { ok: false, reason: "duplicate" };
  }
  const { data, error } = await supabase()
    .from("meetup_locations")
    .insert({ organization_id: orgId, name: value.name, building: value.building })
    .select(LOCATION_SELECT)
    .single();
  if (error) throw new Error("location insert failed");
  return { ok: true, location: toLocation(data as LocationRow) };
}

export type SetActiveResult =
  | { ok: true; location: AdminLocationDto }
  | { ok: false; reason: "not_found" | "forbidden" };

/**
 * Switch a spot on or off. There is no delete anywhere: a spot a past meetup
 * references must keep resolving.
 *   not_found  no such spot
 *   forbidden  the spot belongs to another school
 */
export async function setLocationActive(
  orgId: string,
  id: string,
  isActive: boolean,
): Promise<SetActiveResult> {
  if (!isUuid(id)) return { ok: false, reason: "not_found" };
  const db = supabase();

  const { data: found, error: findError } = await db
    .from("meetup_locations")
    .select("id, organization_id")
    .eq("id", id)
    .maybeSingle();
  if (findError) throw new Error("location lookup failed");
  if (!found) return { ok: false, reason: "not_found" };
  if (found.organization_id !== orgId) return { ok: false, reason: "forbidden" };

  const { data, error } = await db
    .from("meetup_locations")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("organization_id", orgId)
    .select(LOCATION_SELECT)
    .single();
  if (error) throw new Error("location update failed");
  return { ok: true, location: toLocation(data as LocationRow) };
}

type ActivityRow = {
  id: string;
  proposer_user_id: string;
  recipient_user_id: string;
  starts_at: string;
  status: AdminMeetupRow["status"];
  created_at: string;
  responded_at: string | null;
  location: { name: string; is_active: boolean };
};

/** The school's meetups, newest first. No notes, no addresses, no user ids. */
export async function listMeetupsForAdmin(
  orgId: string,
  limit = 200,
): Promise<AdminMeetupRow[]> {
  const db = supabase();
  const { data, error } = await db
    .from("meetups")
    .select(
      "id, proposer_user_id, recipient_user_id, starts_at, status, created_at, responded_at, " +
        "location:meetup_locations!meetups_location_same_org_fkey(name, is_active)",
    )
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("meetups lookup failed");
  const rows = (data ?? []) as unknown as ActivityRow[];
  if (rows.length === 0) return [];

  const ids = [...new Set(rows.flatMap((r) => [r.proposer_user_id, r.recipient_user_id]))];
  const { data: profiles, error: profileError } = await db
    .from("profiles")
    .select("user_id, first_name, last_name")
    .in("user_id", ids);
  if (profileError) throw new Error("profiles lookup failed");

  const names = new Map(
    (profiles ?? []).map((p) => [
      p.user_id as string,
      `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unknown student",
    ]),
  );

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    proposerName: names.get(r.proposer_user_id) ?? "Unknown student",
    recipientName: names.get(r.recipient_user_id) ?? "Unknown student",
    startsAt: new Date(r.starts_at).toISOString(),
    createdAt: r.created_at,
    respondedAt: r.responded_at,
    location: { name: r.location.name, isActive: r.location.is_active },
  }));
}
