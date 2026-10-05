import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchEligibleUserIds } from "./eligibleSearchProfiles";
import { EMPTY_DASHBOARD_FILTERS } from "@/features/school/data/dashboardFilters";

const ORG_ID = "org-ut";
const VIEWER = "user_viewer";

// Chainable, awaitable stand-in for a Supabase query builder. Records every
// table that gets queried so we can assert what the search pool depends on.
function makeSupabase(rows: { user_id: string }[] | null) {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    then: (resolve: (v: { data: typeof rows }) => unknown) =>
      resolve({ data: rows }),
  };
  const from = vi.fn().mockReturnValue(query);
  return { supabase: { from } as unknown as SupabaseClient, from, query };
}

describe("fetchEligibleUserIds", () => {
  it("returns every school profile in the org except the viewer", async () => {
    const { supabase, query } = makeSupabase([
      { user_id: "user_a" },
      { user_id: VIEWER },
      { user_id: "user_b" },
    ]);

    const ids = await fetchEligibleUserIds(
      supabase,
      VIEWER,
      ORG_ID,
      EMPTY_DASHBOARD_FILTERS,
    );

    expect(ids).toEqual(["user_a", "user_b"]);
    expect(query.eq).toHaveBeenCalledWith("organization_id", ORG_ID);
  });

  it("does not exclude profiles the viewer has liked (regression)", async () => {
    // Liked people used to vanish from search. The pool must come only from
    // school_profiles; the likes table must never be consulted.
    const { supabase, from } = makeSupabase([
      { user_id: "user_liked" },
      { user_id: "user_other" },
    ]);

    const ids = await fetchEligibleUserIds(
      supabase,
      VIEWER,
      ORG_ID,
      EMPTY_DASHBOARD_FILTERS,
    );

    expect(ids).toContain("user_liked");
    expect(from).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith("school_profiles");
  });

  it("applies no extra filters when none are set", async () => {
    const { supabase, query } = makeSupabase([]);

    await fetchEligibleUserIds(
      supabase,
      VIEWER,
      ORG_ID,
      EMPTY_DASHBOARD_FILTERS,
    );

    expect(query.in).not.toHaveBeenCalled();
    expect(query.overlaps).not.toHaveBeenCalled();
    expect(query.eq).toHaveBeenCalledTimes(1);
  });

  it("applies college, sector, grad year and intent filters", async () => {
    const { supabase, query } = makeSupabase([{ user_id: "user_a" }]);

    await fetchEligibleUserIds(supabase, VIEWER, ORG_ID, {
      colleges: ["engineering"],
      sectors: ["ai"],
      gradYear: 2027,
      intent: "join_me",
    });

    expect(query.in).toHaveBeenCalledWith("college", ["engineering"]);
    expect(query.overlaps).toHaveBeenCalledWith("sector_interests", ["ai"]);
    expect(query.eq).toHaveBeenCalledWith("graduation_year", 2027);
    // "no_preference" profiles match any intent filter
    expect(query.in).toHaveBeenCalledWith("intent", [
      "join_me",
      "no_preference",
    ]);
  });

  it("returns an empty list when the query returns no data", async () => {
    const { supabase } = makeSupabase(null);

    const ids = await fetchEligibleUserIds(
      supabase,
      VIEWER,
      ORG_ID,
      EMPTY_DASHBOARD_FILTERS,
    );

    expect(ids).toEqual([]);
  });
});
