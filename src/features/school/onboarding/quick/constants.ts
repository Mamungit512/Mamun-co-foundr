// Copy and option lists for the quick school onboarding. UT-specific strings
// are hardcoded for now and should move to the org registry when a second
// school uses this flow.

export const SCHOOL_SHORT_NAME = "UT";

export const TOTAL_STEPS = 5;

// Step 1 (consent) lives on /accept-policies, behind the middleware consent
// gate. The onboarding page itself only renders steps 2–5.
export type FlowStep = 2 | 3 | 4 | 5;
export const FLOW_STEPS: FlowStep[] = [2, 3, 4, 5];

export const SHELL_COPY = {
  eyebrow: "Mamun × University of Texas at Austin",
  title: "Create your profile",
  sub: "Five quick steps, mostly taps. Your progress saves as you go, so you can leave and pick up where you stopped.",
  doneTitle: "Your Fit Card",
  doneSub: "This is what other UT founders see. Boost it whenever you like.",
};

// Prefilled so most students never touch the location field; "Change" in
// step 2 opens the full LocationSelector for anyone based elsewhere.
export const DEFAULT_LOCATION = {
  city: "Austin",
  state: "Texas",
  country: "United States",
};

export const INTENT_OPTIONS = [
  {
    value: "join_me",
    title: "Join me",
    description: "I have an idea and need a co-founder",
    tag: "Looking for a co-founder",
    sentence: "Has an idea and needs a co-founder.",
  },
  {
    value: "seeking_to_join",
    title: "I’ll join someone’s idea",
    description: "I want to help build another founder’s startup",
    tag: "Seeking to join",
    sentence: "Wants to join another founder’s idea.",
  },
  {
    value: "no_preference",
    title: "Open to either",
    description: "Show me both kinds of founders",
    tag: "Open to either",
    sentence: "Open to starting something or joining one.",
  },
] as const;

export const STARTUP_MODE_OPTIONS = [
  { value: "building", label: "Yes, building" },
  { value: "idea", label: "Have an idea" },
  { value: "exploring", label: "No, exploring" },
] as const;

// Values match startup_funding_enum.
export const IDEA_STAGE = "Idea stage";
export const STARTUP_STAGES = [
  IDEA_STAGE,
  "Bootstrapped",
  "Friends & Family",
  "Pre-seed",
  "Seed",
  "Series A+",
] as const;

export const ARCHETYPE_OPTIONS = [
  { value: "the_scaler", title: "The Scaler", description: "Grows things fast: users, revenue, the team." },
  { value: "the_steward", title: "The Steward", description: "Keeps it running: ops, people, the details." },
  { value: "the_architect", title: "The Architect", description: "Designs the system: product and how it works." },
] as const;

export const ARCHETYPE_UNSURE = {
  title: "Not sure yet",
  description: "Totally fine. It won’t hurt your matches.",
};

export const MISSION_STARTERS = [
  { label: "Make it easier for…", text: "Make it easier for " },
  { label: "Fix how…", text: "Fix how " },
  { label: "Build the tool I wish I had…", text: "Build the tool I wish I had for " },
];

export const INTRO_MIN = 15;
export const INTRO_MAX = 500;
export const TITLE_MAX = 80;
export const INTERESTS_MAX = 3;
