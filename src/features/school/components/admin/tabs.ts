export type AdminTab =
  | "overview"
  | "roster"
  | "connections"
  | "sources"
  | "reports";

export type AdminTabConfig = {
  id: AdminTab;
  label: string;
  title: string;
  subtitle?: string;
  // Hidden tabs are left out of the tab bar and unreachable by URL.
  hidden?: boolean;
};

export const ADMIN_TABS: AdminTabConfig[] = [
  { id: "overview", label: "Overview", title: "Cohort health" },
  {
    id: "roster",
    label: "Roster",
    title: "Roster",
    subtitle: "Student profiles at your school.",
  },
  {
    id: "connections",
    label: "Connections",
    title: "Connections",
    subtitle: "We Match pairs and conversations between your students.",
  },
  // Sources ships with the reconciliation backend (build plan Phase 5).
  { id: "sources", label: "Sources", title: "Sources", hidden: true },
  {
    id: "reports",
    label: "Reports",
    title: "Reports",
    subtitle: "CSV snapshots, generated on demand.",
  },
];

export const DEFAULT_ADMIN_TAB: AdminTab = "overview";

// Maps a raw ?tab= value to a reachable tab. Anything unknown or hidden,
// including the retired "analytics", lands on Overview.
export function parseAdminTab(value: string | null): AdminTab {
  const tab = ADMIN_TABS.find((t) => t.id === value && !t.hidden);
  return tab ? tab.id : DEFAULT_ADMIN_TAB;
}

export function getAdminTabConfig(id: AdminTab): AdminTabConfig {
  return ADMIN_TABS.find((t) => t.id === id)!;
}
