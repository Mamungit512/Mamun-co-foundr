import { isDegreeType, isUTCollege } from "@/features/school/data/utSchoolsAndMajors";
import {
  FLOW_STEPS,
  IDEA_STAGE,
  INTERESTS_MAX,
  INTRO_MIN,
  type FlowStep,
} from "@/features/school/onboarding/quick/constants";

// UI-only answers that don't map onto an OnboardingData field.
export type QuickUi = {
  // "Not sure yet" on the founder archetype question; archetype stays unset.
  archetypeUnsure?: boolean;
  // "Other" on the graduation year question, plus the raw text typed so far.
  gradYearOther?: boolean;
  gradYearText?: string;
  // The three-way startup answer. Only "has a startup" is stored, so this is
  // derived from the saved stage when it isn't in the draft.
  startupMode?: StartupMode;
};

export type StartupMode = "building" | "idea" | "exploring";

type UtStatus = "student" | "alumni";

const currentYear = () => new Date().getFullYear();

// Same bounds the previous UT form enforced: students graduate this year or
// within ten years, alumni any time since 1965.
export function gradYearBounds(status: UtStatus, now = currentYear()) {
  return status === "alumni" ? { min: 1965, max: now } : { min: now, max: now + 10 };
}

// The five quick-pick years shown before "Other".
export function gradYearChoices(status: UtStatus, now = currentYear()): number[] {
  return status === "alumni"
    ? [now - 1, now - 2, now - 3, now - 4, now - 5]
    : [now, now + 1, now + 2, now + 3, now + 4];
}

export function isGradYearValid(
  status: UtStatus | undefined,
  gradYear: number | undefined,
  now = currentYear(),
): boolean {
  if (!status || gradYear === undefined || !Number.isInteger(gradYear)) return false;
  const { min, max } = gradYearBounds(status, now);
  return gradYear >= min && gradYear <= max;
}

// Strips scheme, "www." and trailing slashes so "https://www.linkedin.com/in/x/"
// and "linkedin.com/in/x" compare (and display) the same.
export function cleanUrl(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

export const cleanLinkedin = cleanUrl;

// Blank is allowed; otherwise it must be a personal profile link.
export function isLinkedinValid(value: string | undefined): boolean {
  const cleaned = cleanLinkedin(value);
  return !cleaned || /^([a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]{2,100}$/i.test(cleaned);
}

// Blank is allowed; otherwise it must be a GitHub profile or repo link.
export function isGithubValid(value: string | undefined): boolean {
  const cleaned = cleanUrl(value);
  return !cleaned || /^github\.com\/[A-Za-z0-9-]{1,39}(\/\S*)?$/i.test(cleaned);
}

// Blank is allowed; otherwise it needs a host with a dot and no spaces.
export function isWebsiteValid(value: string | undefined): boolean {
  const cleaned = cleanUrl(value);
  return !cleaned || /^[^\s/@]+\.[^\s/@.]{2,}(\/\S*)?$/.test(cleaned);
}

export function isIntroValid(value: string | undefined): boolean {
  return (value ?? "").trim().length >= INTRO_MIN;
}

export function missingFor(
  step: FlowStep,
  data: OnboardingData,
  ui: QuickUi,
  now = currentYear(),
): string[] {
  const missing: string[] = [];

  if (step === 2) {
    if (!data.pfp_url) missing.push("a photo");
    if (!data.firstName?.trim() || !data.lastName?.trim()) missing.push("your name");
    if (!data.utStatus) missing.push("student or alumni");
    else if (!isGradYearValid(data.utStatus, data.gradYear, now)) missing.push("graduation year");
    if (!isDegreeType(data.utDegreeType)) missing.push("degree level");
    if (!isUTCollege(data.utCollege)) missing.push("your college");
    if (!data.city?.trim() || !data.country?.trim()) missing.push("where you’re based");
  }

  if (step === 3) {
    if (!data.title?.trim()) missing.push("your title");
    if (!data.isTechnical) missing.push("technical background");
    if (!data.archetype && !ui.archetypeUnsure) missing.push("a founder type");
  }

  if (step === 4) {
    if (!ui.startupMode) missing.push("whether you have a startup");
    else if (ui.startupMode !== "exploring" && !data.startupName?.trim()) missing.push("your startup’s name");
    if (!isLinkedinValid(data.linkedin)) missing.push("a valid LinkedIn link (or leave it blank)");
    if (!isGithubValid(data.git)) missing.push("a valid GitHub link (or leave it blank)");
    if (!isWebsiteValid(data.startupWebsite)) missing.push("a valid startup website (or leave it blank)");
  }

  if (step === 5) {
    if (!data.intent) missing.push("what you’re looking for");
    const interests = data.utSectorInterests ?? [];
    if (interests.length === 0) missing.push("at least 1 interest");
    else if (interests.length > INTERESTS_MAX) missing.push(`${INTERESTS_MAX} interests at most`);
    if (!isIntroValid(data.personalIntro)) missing.push(`a longer mission (${INTRO_MIN}+ characters)`);
  }

  return missing;
}

export function firstIncompleteStep(data: OnboardingData, ui: QuickUi): FlowStep | null {
  return FLOW_STEPS.find((step) => missingFor(step, data, ui).length > 0) ?? null;
}

export function formatMissing(missing: string[]): string {
  return missing.length ? `To continue: ${missing.join(", ")}.` : "";
}

// Restores "Other" for a saved year that isn't one of the quick picks, so a
// returning user sees their year instead of an unselected grid, and the
// startup answer from the saved startup fields.
export function normalizeUi(data: OnboardingData, ui: QuickUi, now = currentYear()): QuickUi {
  const next = { ...ui };
  if (!next.startupMode && data.hasStartup) {
    next.startupMode =
      data.hasStartup === "no" ? "exploring" : data.startupFunding === IDEA_STAGE ? "idea" : "building";
  }
  if (data.utStatus && data.gradYear !== undefined && !next.gradYearOther) {
    if (!gradYearChoices(data.utStatus, now).includes(data.gradYear)) {
      next.gradYearOther = true;
      next.gradYearText = String(data.gradYear);
    }
  }
  return next;
}
