export type ProfileIntentFilter = "join_me" | "seeking_to_join";

export type DashboardFilters = {
  colleges: string[];
  sectors: string[];
  gradYear: number | null;
  intent: ProfileIntentFilter | null;
};

export const EMPTY_DASHBOARD_FILTERS: DashboardFilters = {
  colleges: [],
  sectors: [],
  gradYear: null,
  intent: null,
};

export type RelaxDimension = "college" | "sectors" | "gradYear" | "intent";

/**
 * A single "relax this filter" suggestion returned when a search produces zero
 * matches purely because hard filters cut everyone out. `countIfRelaxed` is how
 * many candidates re-enter the pool if this one dimension is dropped.
 */
export type RelaxSuggestion = {
  dimension: RelaxDimension;
  label: string;
  /** Whether this filter came from the user's sidebar or was AI-inferred. */
  source: "user" | "inferred";
  /** Inferred-dismiss keys for this dimension (e.g. ["sector:fintech"]). */
  dismissKeys: string[];
  countIfRelaxed: number;
};

export type SearchEmptyReason = { relaxations: RelaxSuggestion[] } | null;

export function normalizeDashboardFilters(
  input: Partial<DashboardFilters> | undefined,
): DashboardFilters {
  if (!input) return EMPTY_DASHBOARD_FILTERS;
  return {
    colleges: Array.isArray(input.colleges)
      ? input.colleges.filter((c): c is string => typeof c === "string")
      : [],
    sectors: Array.isArray(input.sectors)
      ? input.sectors.filter((s): s is string => typeof s === "string")
      : [],
    gradYear: typeof input.gradYear === "number" ? input.gradYear : null,
    intent:
      input.intent === "join_me" || input.intent === "seeking_to_join"
        ? input.intent
        : null,
  };
}

const STORAGE_KEY = "school-dashboard-filters";

export function loadDashboardFilters(): DashboardFilters {
  if (typeof window === "undefined") return EMPTY_DASHBOARD_FILTERS;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_DASHBOARD_FILTERS;
    const parsed = JSON.parse(raw) as DashboardFilters;
    return {
      colleges: Array.isArray(parsed.colleges) ? parsed.colleges : [],
      sectors: Array.isArray(parsed.sectors) ? parsed.sectors : [],
      gradYear:
        typeof parsed.gradYear === "number" ? parsed.gradYear : null,
      intent:
        parsed.intent === "join_me" || parsed.intent === "seeking_to_join"
          ? parsed.intent
          : null,
    };
  } catch {
    return EMPTY_DASHBOARD_FILTERS;
  }
}

export function saveDashboardFilters(filters: DashboardFilters): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
}

export function hasActiveFilters(filters: DashboardFilters): boolean {
  return (
    filters.colleges.length > 0 ||
    filters.sectors.length > 0 ||
    filters.gradYear !== null ||
    filters.intent !== null
  );
}

/** Matches the swipe card / filter sidebar viewport height on desktop */
export function getDashboardPanelHeightClass(searchOpen: boolean): string {
  return searchOpen
    ? "h-[calc(100vh-210px)] max-h-[calc(100vh-210px)]"
    : "h-[calc(100vh-150px)] max-h-[calc(100vh-150px)]";
}

export function buildProfilesQueryString(filters: DashboardFilters): string {
  const params = new URLSearchParams();
  if (filters.colleges.length > 0) {
    params.set("colleges", filters.colleges.join(","));
  }
  if (filters.sectors.length > 0) {
    params.set("sectors", filters.sectors.join(","));
  }
  if (filters.gradYear !== null) {
    params.set("gradYear", String(filters.gradYear));
  }
  if (filters.intent) params.set("intent", filters.intent);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
