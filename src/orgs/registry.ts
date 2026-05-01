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
      wordmark: "Texas",
    },
    landing: {
      headline: "Find your co-founder at UT Austin.",
      subheadline:
        "An exclusive co-founder matching community for Longhorns building the next great company.",
      heroImageUrl: "/orgs/ut/hero.jpg",
      ctaPrimaryLabel: "Join with your UT email",
      ctaSecondaryLabel: "Sign in",
    },
  },
};

export function getOrgConfig(slug: string): OrgConfig | null {
  return ORG_REGISTRY[slug] ?? null;
}
