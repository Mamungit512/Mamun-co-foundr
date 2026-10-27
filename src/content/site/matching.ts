// /matching copy. Final — do not rewrite. Source: Main.dc.html (matching
// page). Mock people are fictional.

import type { Milestone } from "./home";

export const MATCHING_HERO = {
  eyebrow: "Co-founder matching · live now",
  title: "Values-aligned co-founder discovery, inside your ecosystem",
  subline:
    "Most student startups die at the co-founder stage. Mamun matches students and alumni on shared mission, complementary skills and character — not résumés — and keeps the pool inside the institution.",
  secondary: { href: "/platform", label: "See it running" },
};

export const WORKSPACE_MOCK = {
  description:
    "Illustration of a co-founder workspace: Hannah B. and Ethan C. are linked as co-founders on a one-year plan, in progress at week 4, with four milestones completed and a pitch at the campus invent night in progress.",
  pair: [
    { initials: "HB" },
    { initials: "EC" },
  ],
  title: "Hannah B. × Ethan C.",
  roles: "Co-founder · growth & sales  ·  Co-founder · product & engineering",
  linked: "Co-founder linked",
  statusLabel: "Status",
  status: { selected: "In progress", options: ["In progress", "Paused", "Completed"] },
  lengthLabel: "How long",
  length: { selected: "1 year", options: ["12 weeks", "6 months", "1 year"] },
  started: "Started 18 May · week 4",
  ends: "Ends 17 May 2027 · extend or shorten anytime",
  milestones: [
    { title: "Founder agreement & equity split drafted", date: "20 May", status: "Completed", state: "done" },
    { title: "Cap table created on platform", date: "26 May", status: "Completed", state: "done" },
    { title: "MVP scope locked", date: "15 Jun", status: "Completed", state: "done" },
    { title: "First 10 user interviews done", date: "3 Jul", status: "Completed", state: "done" },
    { title: "Pitch at the campus invent night", date: "14 Aug", status: "In progress", state: "current" },
    { title: "Apply to the accelerator", date: "4 Sep", status: "Up next", state: "next" },
  ] satisfies Milestone[],
};

export const SHIPS_WITH = {
  title: "What ships with every contract",
  aside: "Included, not add-ons",
  items: [
    { title: "Admin messaging dashboard", body: "See cohort activity and step in where a match needs a nudge." },
    { title: "LLM natural-language search", body: "“Biomedical engineer who wants to build in Austin” returns the cohort." },
    { title: "CV & match-history exports", body: "The report your annual program review already asks for." },
    { title: "Cap-table builder", body: "Equity split settled early, before it becomes the argument." },
    { title: "Email seeding & bulk invites", body: "Launch a cohort from a list you already own." },
    { title: "SSO + FERPA-isolated onboarding", body: "Cleared UT's IT security review before the first student joined." },
    { title: "Luma event integration", body: "Mixers and demo days connected to the cohort that attends them." },
    { title: "Semester cohort cadence", body: "The platform runs on the academic calendar, not a sales quarter." },
  ],
};

export const FIRST_CHECK = {
  title: "The first check shouldn't require a warm intro",
  body: "Venture creation runs through two filters that have nothing to do with talent. Your campus can route around both — teams form on merit, before anyone needs a gatekeeper.",
  cards: [
    {
      label: "Who gets through today",
      body: "Repeat founders, elite-school networks, people who already know a partner.",
      live: false,
    },
    {
      label: "Who gets left out",
      body: "First-gen students, non-business majors, builders without a network — most of your campus.",
      live: true,
    },
  ],
};

export const MATCHING_CTA = { title: "Run your first cohort next semester" };
