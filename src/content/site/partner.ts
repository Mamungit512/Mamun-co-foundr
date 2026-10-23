// /partner copy. Final — do not rewrite. Source: Main.dc.html (partner
// page). UT is the only institution named; the rest is in aggregate.

export const PARTNER_INTRO = {
  eyebrow: "Partner with us",
  title: "Thirty minutes, and you'll know if this fits your campus",
  body: "We'll walk your director and IT lead through the platform, the FERPA posture and pricing for your enrollment. No RFP required to start — it lands through one director's office.",
  steps: [
    { index: "01", title: "Discovery call", body: "Your cohort calendar, which office signs, what your reporting needs to show." },
    { index: "02", title: "Security & FERPA review", body: "We've cleared this before. Documentation ready for your IT team." },
    { index: "03", title: "Cohort launch", body: "Seeded from your own lists, live on your domain, inside one semester." },
  ],
  motion: {
    label: "Already in motion",
    body: "Vendor at the University of Texas, first cohort running. One further campus in evaluation and four more in the Texas pipeline.",
  },
};

export const PARTNER_FORM = {
  title: "Book a demo",
  fields: {
    firstName: { label: "First name", placeholder: "Jordan" },
    lastName: { label: "Last name", placeholder: "Alvarez" },
    email: {
      label: "Institutional email",
      placeholder: "name@university.edu",
      hint: "Use your .edu address. We only accept campus emails.",
    },
    institution: { label: "Institution", placeholder: "University name" },
    enrollment: { label: "Enrollment", placeholder: "Select a range" },
    office: { label: "Your office" },
    notes: { label: "Anything we should know", placeholder: "Budget cycle, timeline, who else should be on the call." },
  },
  // Must match the choices in the Google Form exactly, or the answer is dropped.
  enrollmentOptions: ["Under 5,000", "5,000 – 15,000", "15,000 – 30,000", "30,000 – 50,000", "50,000+"],
  // Must match the "Your office" checkbox choices in the Google Form.
  officeOptions: ["Entrepreneurship", "Alumni relations", "IT / procurement", "Faculty"],
  submit: "Request a demo",
  submitting: "Sending…",
  replyPrefix: "We reply within one business day. Or email ",
  email: "mamun@mamuncofoundr.com",
  replySuffix: " directly.",
  errors: {
    eduOnly: "Use your .edu address.",
    required: "Required.",
  },
  // Not in the prototype — placeholder copy for the success and failure
  // states the spec asks for (§11.2). Needs sign-off.
  success: {
    title: "Thanks — we've got it.",
    body: "We'll reply within one business day. If you'd rather pick a time now:",
    link: "Book a demo",
  },
  failure: {
    body: "That didn't go through. Try again, or email us at ",
    retry: "Try again",
  },
};

export const PARTNER_STATS = [
  { value: "1", label: "Vendor live · University of Texas", lime: true },
  { value: "1", label: "University in evaluation", lime: false },
  { value: "4", label: "Campuses in the Texas pipeline", lime: false },
  { value: "1 semester", label: "From signature to a running cohort", lime: false },
];

/** .edu only — free mail and every other domain is rejected (spec §11.2). */
export function isEduEmail(value: string) {
  return /^[^\s@]+@([a-z0-9-]+\.)+edu$/i.test(value.trim());
}
