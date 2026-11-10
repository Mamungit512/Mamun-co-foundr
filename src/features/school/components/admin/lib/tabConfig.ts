export type AdminTab =
  | "overview"
  | "roster"
  | "connections"
  | "meetups"
  | "sources"
  | "reports";

// Per-school rollout switches, resolved on the server (see useSchool().features).
export type AdminFeatures = { meetups: boolean };
const NO_FEATURES: AdminFeatures = { meetups: false };

export type AdminTabConfig = {
  id: AdminTab;
  label: string;
  title: string;
  subtitle?: string;
  // Hidden tabs are left out of the tab bar and unreachable by URL.
  hidden?: boolean;
  // Shown only for schools where this rollout switch is on. Off behaves
  // exactly like hidden.
  feature?: keyof AdminFeatures;
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
  {
    id: "meetups",
    label: "Meetups",
    title: "Meetups",
    subtitle:
      "Approved campus spots, and the meetups your students have proposed.",
    feature: "meetups",
  },
  {
    id: "sources",
    label: "Sources",
    title: "Sources",
    subtitle: "Where each number comes from, and how the two systems agree.",
  },
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
export function isTabAvailable(
  tab: AdminTabConfig,
  features: AdminFeatures = NO_FEATURES,
): boolean {
  return !tab.hidden && (!tab.feature || features[tab.feature]);
}

export function parseAdminTab(
  value: string | null,
  features: AdminFeatures = NO_FEATURES,
): AdminTab {
  const tab = ADMIN_TABS.find(
    (t) => t.id === value && isTabAvailable(t, features),
  );
  return tab ? tab.id : DEFAULT_ADMIN_TAB;
}

export function getAdminTabConfig(id: AdminTab): AdminTabConfig {
  return ADMIN_TABS.find((t) => t.id === id)!;
}

export function isTabVisible(
  id: AdminTab,
  features: AdminFeatures = NO_FEATURES,
): boolean {
  return isTabAvailable(getAdminTabConfig(id), features);
}
