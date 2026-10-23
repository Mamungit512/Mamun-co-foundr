// /pricing copy. Final — do not rewrite. Source: Main.dc.html (pricing
// page). No public prices: no $ figure appears anywhere on this page.

export const PRICING_HERO = {
  eyebrow: "Pricing",
  title: "Licensed per institution, per year",
  subline:
    "Two things set the number: your enrollment and how many colleges you cover. Pick a tier below to see what that includes — we return a written quote within two business days of the call.",
  cta: "Request a quote",
  terms: [
    { label: "Term", body: "One academic year, annual or multi-year" },
    { label: "Included in every tier", body: "SSO setup, FERPA review, onboarding, unlimited student seats" },
    { label: "No charge for", body: "Per-student fees, implementation, or an IT build — there isn't one" },
  ],
};

export const TIERS = [
  {
    label: "Tier 1",
    name: "Small & community",
    band: "Under ~5,000 students",
    features: [
      "Co-Founder Matching, full feature set",
      "One director office, one college",
      "Semester cohort cadence",
      "SSO + FERPA onboarding",
    ],
    featured: false,
  },
  {
    label: "Tier 2 · most common",
    name: "Mid-size university",
    band: "~5,000–20,000 students",
    features: [
      "Everything in Tier 1",
      "Multi-college cohorts",
      "Admin dashboard & exports for every office",
      "Advisor support from our team",
    ],
    featured: true,
  },
  {
    label: "Tier 3",
    name: "Flagship & R1",
    band: "20,000+ students",
    features: [
      "Everything in Tier 2",
      "Campus-wide rollout across colleges",
      "Named campus success lead",
      "Demo day built into the cohort calendar",
    ],
    featured: false,
  },
];

export const TIER_CTA = "Request a quote";

export const INCLUDED = {
  title: "What's included in every contract",
  body: "No implementation fee, no per-seat surprises mid-year, and no charge for the students themselves. You keep complete ownership of your domain and branding.",
  items: [
    { label: "Onboarding & cohort launch", value: "Included" },
    { label: "FERPA & IT security review support", value: "Included" },
    { label: "Student and alumni accounts", value: "Unlimited" },
    { label: "Reporting exports for annual reviews", value: "Included" },
  ],
};

export const PRICING_CTA = { title: "Get a quote sized to your enrollment", cta: "Contact sales" };
