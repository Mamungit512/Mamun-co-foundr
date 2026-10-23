// Homepage copy. Final — do not rewrite. Source: Main.dc.html (Website tab
// of the Mamun Studio II design canvas). The University of Texas is the only
// institution that may be named; everything else is in aggregate.

export const HERO = {
  title: "The co-founder engine, run by your institution",
  subline: "Co-founder matching in one FERPA-compliant platform your campus controls.",
};

export const CREDIBILITY = {
  status: "Vendor at the University of Texas · Texas pipeline in evaluation",
  named: "The University of Texas at Austin",
  counts: ["One campus in evaluation", "Four more in the Texas pipeline"],
};

export const PIVOT = {
  eyebrow: "The pivot",
  title: "We used to sell to founders. Now we sell to the institutions behind them.",
  body: [
    "Mamun started as an open, global, Muslim-first network where any founder could find a co-founder who shared their mission. The matching worked. The trust never did — open sign-up cannot verify anyone, and nobody was accountable when a pairing fell apart.",
    "Universities already hold identity, verification and accountability. So we moved the engine inside the campus and sold it to the office that runs the program. The University of Texas at Austin is the first.",
  ],
  before: {
    label: "2023–2025 · before",
    title: "Open consumer network",
    points: [
      "Anyone, anywhere, self-reported",
      "Individual founders paid, and churned on match",
      "An introduction, then silence",
      "No verification, no institution behind a profile",
    ],
  },
  now: {
    label: "2026 · now",
    title: "Licensed institutional platform",
    points: [
      "Your students, SSO-gated and faculty-verified",
      "The institution licenses it, per year",
      "A workspace with milestones your office can see",
      "Cohort outcomes exported every term",
    ],
  },
};

export const TRUST = [
  { title: "Closed to your campus", body: "SSO-gated. Students opt in and keep their data." },
  { title: "Your domain, your branding", body: "Runs on your subdomain, under your marks." },
  { title: "Live in a semester", body: "One director's office signs. No RFP, no IT build." },
];

export const MATCHING = {
  eyebrow: "Live now",
  title: "Co-Founder Matching",
  body: "Students and alumni match on shared mission, complementary skills and character. Natural-language search, semester cohorts, and a cap-table builder for the day it gets real. Live at UT since spring.",
  link: { href: "/matching", label: "Explore matching" },
};

// Fictional person — mock content.
export const PROFILE_MOCK = {
  description:
    "Illustration of a student profile in the matching app: Amara Osei, Biomedical Engineering, faculty verified, looking for a commercial partner. An invite is sent and lands in her Connections.",
  initials: "AO",
  name: "Amara Osei",
  program: "Biomedical Engineering '27 · Cockrell",
  badge: "Faculty verified",
  aboutLabel: "About",
  about:
    "Diagnostics that work in clinics without reliable power. Looking for a commercial partner who can sell into health systems.",
  interestsLabel: "Category interests",
  interests: { selected: "HealthTech", others: ["DeepTech", "Impact"] },
  experienceLabel: "Experience",
  experience:
    "Two years in Dr. Reyes' lab, two provisional patents filed, regulatory pathway mapped.",
  seeking: "Seeking a technical partner",
  action: "Send invite",
  toast: "Invite sent · it lands in Amara's Connections",
};

export const WORKSPACE = {
  eyebrow: "Shared · matching",
  title: "A workspace opens on every match",
  body: "Milestones with dates, notes either side can post, eight weeks to a full year.",
  link: { href: "/platform", label: "Look inside" },
};

export type MilestoneState = "done" | "current" | "next" | "planned";
export type Milestone = { title: string; date: string; status: string; state: MilestoneState };

// Fictional people — mock content.
export const TIMELINE_MOCK = {
  description:
    "Illustration of a shared work timeline: three of seven milestones done, the mid-point review with a faculty check-in in progress, and notes from both co-founders.",
  title: "Work timeline",
  progress: "3 of 7 done",
  milestones: [
    { title: "Kickoff call — goals, schedule, working style", date: "Jun 2", status: "Completed", state: "done" },
    { title: "Founder agreement + equity split signed", date: "Jun 5", status: "Completed", state: "done" },
    { title: "Ship first build — payments prototype", date: "Jun 12", status: "Completed", state: "done" },
    { title: "Mid-point review · faculty check-in", date: "Jul 10", status: "In progress", state: "current" },
    { title: "Final review + cohort report", date: "Aug 21", status: "Up next", state: "next" },
    { title: "New milestone — click to rename", date: "Aug 28", status: "Planned", state: "planned" },
  ] satisfies Milestone[],
  notesLabel: "Notes",
  notesCount: "3 notes",
  notes: [
    { initials: "SR", author: "Sofia R. · Jun 9", body: "Pipeline PR looked great. Let's aim the mid-point review for the week of July 6." },
    { initials: "EG", author: "Elena G. · Jun 10", body: "Sounds good. I'll have the eval dashboard ready to show by then." },
  ],
};

export const ROADMAP = {
  eyebrow: "On the roadmap",
  title: "More from Mamun in 2027",
  body: "Two more tools for student success and venture formation are in development. Ask about them on a demo call.",
  link: "Ask on a demo call",
};

export const WHO_SIGNS = {
  title: "Who signs, and what they get back",
  cards: [
    {
      role: "Entrepreneurship director",
      title: "Venture formation you can report",
      body: "The complaint you hear most — “I can't find anyone to build with” — stops being yours to solve by email. Cohort data lands in your annual report.",
    },
  ],
};
