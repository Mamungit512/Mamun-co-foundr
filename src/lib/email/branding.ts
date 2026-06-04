import { getOrgConfig } from "@/features/school/registry/registry";

export interface ResolvedOrgBranding {
  primaryColor: string;
  wordmark: string;
  logoUrl: string;
}

const MAMUN_DEFAULTS: ResolvedOrgBranding = {
  primaryColor: "#000000",
  wordmark: "Mamun Co-Foundr",
  logoUrl: "/img/mamun-transparent-logo.png",
};

export function resolveOrgBranding(
  slug?: string | null,
  fallbackWordmark?: string,
): ResolvedOrgBranding {
  const config = slug ? getOrgConfig(slug) : null;
  return {
    primaryColor: config?.branding.primaryColor ?? MAMUN_DEFAULTS.primaryColor,
    wordmark:
      config?.branding.wordmark ?? fallbackWordmark ?? MAMUN_DEFAULTS.wordmark,
    logoUrl: config?.branding.logoUrl ?? MAMUN_DEFAULTS.logoUrl,
  };
}
