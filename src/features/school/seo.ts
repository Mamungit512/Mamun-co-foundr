import type { OrgConfig } from "./registry/types";

export type SchoolSeo = {
  /** https://{subdomain}.mamuncofoundr.com — the canonical origin. */
  baseUrl: string;
  /** "{school} Co-Foundr", the site name in share cards. */
  siteName: string;
  title: string;
  description: string;
  ogImage: { url: string; width?: number; height?: number; alt: string };
};

// Search and share metadata for a school subdomain. Each campus gets its own
// title, description and canonical so the sites aren't read as duplicates;
// the registry's seo block overrides the defaults.
export function getSchoolSeo(
  slug: string,
  cfg: OrgConfig,
  org: { name: string; subdomain: string | null } | null,
): SchoolSeo {
  const school = cfg.branding.wordmark ?? org?.name ?? "School Portal";
  const title = cfg.seo?.title ?? `Find Your Co-Founder | ${school} Co-Foundr Matching`;
  const ogImageUrl = cfg.seo?.ogImageUrl;

  return {
    baseUrl: `https://${org?.subdomain ?? slug}.mamuncofoundr.com`,
    siteName: `${school} Co-Foundr`,
    title,
    description: cfg.seo?.description ?? cfg.landing.subheadline,
    ogImage: ogImageUrl
      ? { url: ogImageUrl, width: 1200, height: 630, alt: title }
      : { url: cfg.branding.logoUrl, alt: title },
  };
}
