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

export type OrgConfig = {
  branding: OrgBranding;
  landing: OrgLanding;
  limits: OrgLimits;
  onboarding: OrgOnboarding;
};
