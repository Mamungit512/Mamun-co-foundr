import type { OrgConfig } from "./types";

export const DEFAULT_ORG_CONFIG: OrgConfig = {
  branding: {
    primaryColor: "#000000",
    accentColor: "#333333",
    backgroundColor: "#0d0d0d",
    textColor: "#ffffff",
    logoUrl: "/img/mamun-transparent-logo.png",
  },
  landing: {
    headline: "Find your co-founder.",
    subheadline: "Connect with the right people to build something great.",
    ctaPrimaryLabel: "Get started",
    ctaSecondaryLabel: "Sign in",
  },
  limits: {
    unlimitedSwipes: true,
    unlimitedMessages: true,
  },
  onboarding: {
    totalSteps: 4,
    apiEndpoint: "/api/profile",
    steps: ["photo", "about", "background", "review"],
    step2RequiredFields: [
      "firstName",
      "lastName",
      "title",
      "country",
      "city",
      "experience",
      "personalIntro",
      "isTechnical",
    ],
  },
};

export const ORG_REGISTRY: Record<string, OrgConfig> = {
  ut: {
    branding: {
      primaryColor: "#BF5700",
      accentColor: "#333F48",
      backgroundColor: "#FFFFFF",
      textColor: "#333F48",
      logoUrl: "/orgs/ut/logo.svg",
      faviconUrl: "/orgs/ut/favicon.ico",
      wordmark: "University of Texas",
    },
    landing: {
      headline: "Find your co-founder at the University of Texas.",
      subheadline:
        "An exclusive co-founder matching community for Longhorns building the next great company.",
      heroImageUrl: "/orgs/ut/hero.jpg",
      ctaPrimaryLabel: "Join with your UT email",
      ctaSecondaryLabel: "Sign in",
    },
    limits: {
      unlimitedSwipes: true,
      unlimitedMessages: true,
    },
    onboarding: {
      totalSteps: 5,
      apiEndpoint: "/api/profile",
      steps: ["photo", "about", "startup", "background", "review"],
      step2RequiredFields: [
        "firstName",
        "lastName",
        "title",
        "country",
        "city",
        "experience",
        "personalIntro",
        "isTechnical",
        "utStatus",
      ],
    },
    privacyPolicy: {
      downloadUrl: "/orgs/ut/privacy-policy.pdf",
      version: "2026-06-01",
    },
    termsAndConditions: {
      downloadUrl: "/orgs/ut/terms-and-conditions.pdf",
      version: "2026-06-15",
    },
    emailTemplates: {
      welcome: "ut-welcome-email-01",
      weeklyProfileViews: "ut-weekly-profile-02",
      reEngagement: "ut-re-engagment-03",
      messageNotification: "ut-notifications-design-05",
      mutualMatch: "ut-mutual-match-06",
    },
  },
};

export function getOrgConfig(slug: string): OrgConfig | null {
  return ORG_REGISTRY[slug] ?? null;
}

export const STEP3_COMPLETIONS: Record<string, (data: OnboardingData) => boolean> = {
  ut: (data) =>
    data.hasStartup !== undefined &&
    data.intent !== undefined &&
    (data.hasStartup === "no" ||
      (data.hasStartup === "yes" &&
        data.coFounderStatus !== undefined &&
        data.equityExpectation !== undefined)),
};
