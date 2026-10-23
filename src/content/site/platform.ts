// /platform copy. Final — do not rewrite. Source: Main.dc.html (platform
// page). Every person in the mocks is fictional; the same people appear
// across the tabs.

export const PLATFORM_HERO = {
  eyebrow: "Inside the platform",
  title: "What your students and directors actually see",
  subline:
    "Four surfaces, live today at the University of Texas at Austin: matching, connections, co-founder linking, and the FERPA-gated admin dashboard. Everything runs on your domain and your branding.",
};

export const PLATFORM_TABS = [
  { view: "matching", label: "Matching" },
  { view: "connections", label: "Connections" },
  { view: "cofounders", label: "Co-founders" },
  { view: "admin", label: "Admin dashboard" },
] as const;

export type PlatformView = (typeof PLATFORM_TABS)[number]["view"];

/** Map a ?view= value to a tab, falling back to the first. */
export function toView(value: string | null | undefined): PlatformView {
  return PLATFORM_TABS.some((tab) => tab.view === value) ? (value as PlatformView) : "matching";
}

export const PLATFORM_NOTE =
  "Live instance at the University of Texas at Austin, shown with cohort data. Runs on your domain, gated by university SSO.";

export const PLATFORM_CTA = { title: "Walk through it with your director and IT lead" };

export const MATCH_TAB = {
  description:
    "Illustration of the matching screen: filters for school department, industry, graduation year and intent on the left; Sarah Kim's profile on the right, a verified Data Science MS student seeking to join a startup, with her mission, skills, needs and working style. Liking her sends a one-sided like that becomes a We Match if she likes back.",
  filtersTitle: "Filters",
  department: { label: "School department", value: "All schools" },
  industry: {
    label: "Industry / interest",
    selected: ["B2B SaaS", "Fintech"],
    others: ["AI/ML", "DeepTech", "Data", "UX", "HealthTech", "BioTech", "Policy", "Impact", "Media", "Consumer", "EdTech", "PropTech", "CleanTech", "GovTech"],
  },
  year: { label: "Graduation year", value: "Any year" },
  intent: { label: "Intent", selected: "● Any", others: ["○ Join me", "○ Seeking to join"] },
  data: { label: "Your data", body: "Visible only inside your institution. Withdraw at any time." },
  profile: {
    initials: "SK",
    name: "Sarah Kim",
    role: "Data Science MS · UX Researcher",
    school: "School of Information, Class of 2027 · Austin, United States",
    verified: "Verified student",
    tags: ["Non-technical", "Data", "UX"],
    intent: "Seeking to join",
    joined: "Joined 26 Jun 2026",
    facts: [
      { label: "Mission", body: "Make research tools usable by the people doing the research. Wants a technical partner who ships fast and argues well." },
      { label: "Brings", body: "Applied statistics, user research, two published studies. Ran UX for a 40-person lab." },
      { label: "Needs", body: "A builder for the platform layer, and someone who has priced software before." },
      { label: "Working style", body: "In person twice a week, async otherwise. Decisions written down." },
    ],
    plansLabel: "Startup plans",
    plans: [
      { label: "Has a startup", value: "No, exploring" },
      { label: "Time investment", value: "6–12 months" },
      { label: "Equity expectation", value: "Open" },
    ],
    actions: { like: "Like", message: "Message", skip: "Skip" },
    hint: "A like is one-sided until it's returned. Mutual likes become a We Match.",
    toast: "Liked · if Sarah likes you back, it becomes a We Match",
  },
};

export const CONNECTIONS_TAB = {
  description:
    "Illustration of the connections screen: three liked students, two messages and one We Match. Elliot Vance and James Chen are matched; Marcus Williams is a We Match.",
  filters: [
    { label: "Liked · 3", selected: true },
    { label: "Messages · 2", selected: false },
    { label: "We Match · 1", selected: false },
  ],
  rows: [
    { initials: "", photo: true, name: "Elliot Vance", meta: "Cockrell Engineering · CS '19 · Backend Engineer", state: "Matched ✓", highlight: true, at: "8" },
    { initials: "JC", photo: false, name: "James Chen", meta: "CS '26 · ML Engineer Intern", state: "Matched ✓", highlight: false, at: "10" },
    { initials: "MW", photo: false, name: "Marcus Williams", meta: "Neuroscience '26 · Digital health builder", state: "We Match", highlight: false, at: "12" },
  ],
  action: "Message",
  footer: "Liked, Messages and We Match are the three states a student moves through. The mutual-match rate is what the director reports.",
  dashboardLink: "See it in the dashboard",
};

export const COFOUNDERS_TAB = {
  description:
    "Illustration of the co-founder linking screen: Elliot Vance is linked as a co-founder; an invite to a school email address is typed and sent, and a past invite shows as accepted. Invites are limited to institutional email domains.",
  linkedLabel: "Linked co-founders",
  linked: { name: "Elliot Vance", meta: "Backend Engineer · linked 6 Jun 2026", action: "Unlink" },
  inviteLabel: "Invite a co-founder",
  invitePrefix: "Enter their school email address — they'll receive a link to accept. Must be a ",
  domains: ["@utexas.edu", "@mccombs.utexas.edu", "@mamuncofoundr.com"],
  inviteSuffix: " address.",
  email: "cofounder@utexas.edu",
  role: "Their role (optional)",
  note: "Add a note for them… (optional)",
  send: "Send invite",
  pastLabel: "Past invites",
  past: { email: "elliot@mamuncofoundr.com", status: "Accepted" },
  whyLabel: "Why linking matters",
  why: "A linked pair is the outcome the institution is paying for — it's what turns a match into a venture-formation number.",
  nextLabel: "Next in the platform",
  next: ["Create a cap table →", "Browse UT Luma events →", "Invite another co-founder →"],
  gatingLabel: "Domain gating",
  gating: "Invites are restricted to institutional domains, so the network can't leak outside the campus.",
};

export const ADMIN_TAB = {
  description:
    "Illustration of the FERPA-gated admin dashboard for Fall 2026 at the University of Texas at Austin: 13 signups, 0 active in the last 7 days, 4 connections, 6 messages, 3 technical and 10 non-technical founders (23% technical), a roster of students, and CSV exports for the cohort report and We Match outcomes.",
  ferpa: {
    title: "FERPA notice",
    body: "Student data is protected under FERPA. Access is restricted to authorised school administrators. Do not share or redistribute student records.",
  },
  tabs: [
    { label: "Roster · 13", selected: false },
    { label: "Connections · 4", selected: false },
    { label: "Analytics", selected: true },
    { label: "Reports", selected: false },
  ],
  term: "Fall 2026 · University of Texas at Austin",
  stats: [
    { value: "13", label: "Total signups", lime: false },
    { value: "0", label: "Active, last 7 days", lime: false },
    { value: "4", label: "Total connections", lime: true },
    { value: "6", label: "Total messages", lime: false },
    { value: "3", label: "Technical founders", lime: false },
    { value: "10", label: "Non-technical founders", lime: false },
  ],
  split: { label: "Technical split", technicalShare: 23, technical: "Technical 23%", nonTechnical: "Non-technical 77%" },
  roster: {
    title: "Roster",
    export: "Export CSV",
    columns: ["Student", "Education", "Location", "Type", "Joined"],
    rows: [
      { name: "Elliot Vance", role: "Backend Engineer", education: "Cockrell Engineering, Class of 2019", location: "San Francisco, US", type: "Technical", joined: "6 Jun 2026" },
      { name: "Rowan Adeyemi", role: "Venture Builder", education: "McCombs Business, Class of 2021", location: "Austin, US", type: "Non-technical", joined: "26 Jun 2026" },
      { name: "James Chen", role: "ML Engineer Intern · CS @ UT Austin", education: "—", location: "Austin, US", type: "Technical", joined: "26 Jun 2026" },
      { name: "Sarah Kim", role: "Data Science MS · UX Researcher", education: "—", location: "Austin, US", type: "Non-technical", joined: "26 Jun 2026" },
      { name: "Marcus Williams", role: "Neuroscience Researcher · Digital Health", education: "—", location: "Austin, US", type: "Technical", joined: "26 Jun 2026" },
    ],
  },
  reports: [
    {
      title: "Active cohort report",
      body: "Full snapshot of the current cohort. Each export reflects live data at the moment you download it.",
      fields: ["School", "Founder archetype", "Graduation year", "Industry / interest", "Student or alumni"],
      primary: true,
    },
    {
      title: "We Match outcomes",
      body: "One-sided interest rate and mutual match rate — the core proof point for the annual report.",
      fields: [],
      primary: false,
    },
  ],
  export: "Export CSV",
};
