export type OrgBranding = {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string;
  faviconUrl?: string;
  wordmark?: string;
};

export type OrgLanding = {
  headline: string;
  subheadline: string;
  heroImageUrl?: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
};

export type OrgLimits = {
  unlimitedSwipes: boolean;
  unlimitedMessages: boolean;
};

export type OnboardingStepId = "photo" | "about" | "startup" | "background" | "review";

export type OrgOnboarding = {
  totalSteps: number;
  apiEndpoint: string;
  steps: OnboardingStepId[];
  step2RequiredFields: (keyof OnboardingData)[];
};

export type OrgPrivacyPolicyMeta = {
  downloadUrl?: string;
  /**
   * Version string of the privacy policy currently in force for this org
   * (e.g. its effective date). Bump it to force every user to re-accept.
   * Consumed by the edge-safe consent helper + middleware gate.
   */
  version?: string;
};

export type OrgConfig = {
  branding: OrgBranding;
  landing: OrgLanding;
  limits: OrgLimits;
  onboarding: OrgOnboarding;
  privacyPolicy?: OrgPrivacyPolicyMeta;
  termsAndConditions?: OrgPrivacyPolicyMeta;
  /** Per-org Resend template ID overrides. Keys are EmailType values. Unlisted keys fall back to the default catalog entry. */
  emailTemplates?: Partial<Record<string, string>>;
};
