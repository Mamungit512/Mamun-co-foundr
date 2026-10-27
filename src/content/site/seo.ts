import type { Metadata } from "next";

// Search and share metadata for the five routes (spec §13). www is canonical
// (spec §17). Descriptions are 150–154 characters (spec §13's 150–160, kept
// under 155 per MCFM SEO ticket), drawn from each page's own hero copy —
// never rewritten for keywords. Never "UT Austin" / "at Austin" in
// metadata (MCFM-153).

export const SITE_URL = "https://www.mamuncofoundr.com";
export const SITE_NAME = "Mamun";

export type SitePage = "home" | "matching" | "platform" | "pricing" | "partner";

export const PAGES: Record<SitePage, { path: string; title: string; description: string }> = {
  home: {
    path: "/",
    title: "Mamun — the co-founder engine, run by your institution",
    description:
      "Co-founder matching in one FERPA-compliant platform your campus controls. SSO-gated, on your own domain and your branding. One director's office signs.",
  },
  matching: {
    path: "/matching",
    title: "Co-founder matching",
    description:
      "Most student startups die at the co-founder stage. Mamun matches students and alumni on shared mission, complementary skills and character — not résumés.",
  },
  platform: {
    path: "/platform",
    title: "Inside the platform",
    description:
      "Four surfaces, live today at the University of Texas: matching, connections, co-founder linking, and the FERPA-gated admin dashboard, on your own domain.",
  },
  pricing: {
    path: "/pricing",
    title: "Pricing",
    description:
      "Licensed per institution, per year. Two things set the number: your enrollment and how many colleges you cover. A written quote within two business days.",
  },
  partner: {
    path: "/partner",
    title: "Partner with us",
    description:
      "Thirty minutes. We'll walk your director and IT lead through the platform, the FERPA posture and pricing for your enrollment. No RFP required to start.",
  },
};

// Per-page metadata: title, description, canonical, Open Graph and Twitter.
// The share image itself comes from each route's opengraph-image.tsx.
export function pageMetadata(page: SitePage): Metadata {
  const { path, title, description } = PAGES[page];
  const fullTitle = page === "home" ? title : `${title} — ${SITE_NAME}`;
  return {
    title: page === "home" ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title: fullTitle,
      description,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}

// Organization JSON-LD for the home page (spec §13).
export const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  legalName: "Mamun co-foundr LLC",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Austin",
    addressRegion: "TX",
    addressCountry: "US",
  },
  sameAs: ["https://www.linkedin.com/company/mamunic/"],
};

// SoftwareApplication JSON-LD for /matching (spec §13). No review or rating
// markup.
export const SOFTWARE_APPLICATION = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Mamun Co-founder matching",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: `${SITE_URL}/matching`,
  description: PAGES.matching.description,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
};
