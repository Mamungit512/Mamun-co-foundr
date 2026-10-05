import type { SupabaseClient } from "@supabase/supabase-js";
import type { DashboardFilters } from "@/features/school/data/dashboardFilters";

export async function fetchEligibleUserIds(
  supabase: SupabaseClient,
  userId: string,
  orgId: string,
  filters: DashboardFilters,
): Promise<string[]> {
  // Liked (invited) profiles are intentionally NOT excluded here, unlike the
  // swipe deck: search is a lookup tool, and hiding everyone the viewer has
  // invited made those people unfindable. The result card shows "Invited ✓".
  let schoolQuery = supabase
    .from("school_profiles")
    .select("user_id")
    .eq("organization_id", orgId);

  if (filters.colleges.length > 0) {
    schoolQuery = schoolQuery.in("college", filters.colleges);
  }
  if (filters.sectors.length > 0) {
    schoolQuery = schoolQuery.overlaps("sector_interests", filters.sectors);
  }
  if (filters.gradYear !== null) {
    schoolQuery = schoolQuery.eq("graduation_year", filters.gradYear);
  }
  if (filters.intent) {
    schoolQuery = schoolQuery.in("intent", [filters.intent, "no_preference"]);
  }

  const { data: schoolRows } = await schoolQuery;
  const ids = schoolRows?.map((r) => r.user_id) ?? [];

  return ids.filter((id) => id !== userId);
}
