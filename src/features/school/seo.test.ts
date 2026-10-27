import { describe, it, expect } from "vitest";
import { DEFAULT_ORG_CONFIG, ORG_REGISTRY } from "./registry/registry";
import { getSchoolSeo } from "./seo";

// Co-brand constraint (MCFM-153): never in any metadata.
const BANNED = /UT Austin|at Austin|Texas McCombs/i;

describe("getSchoolSeo", () => {
  const ut = getSchoolSeo("ut", ORG_REGISTRY.ut, { name: "University of Texas", subdomain: "ut" });

  it("uses Tes's final copy for the UT subdomain", () => {
    expect(ut.title).toBe("Find Your Co-Founder | University of Texas Co-Foundr");
    expect(ut.description).toBe(
      "Verified University of Texas students, matched by values and skills. Meet your future co-founder and start building.",
    );
    expect(ut.baseUrl).toBe("https://ut.mamuncofoundr.com");
    expect(ut.ogImage).toMatchObject({ url: "/orgs/ut/og.png", width: 1200, height: 630 });
  });

  it("keeps every registered school under the length limits, without banned strings", () => {
    for (const [slug, cfg] of Object.entries(ORG_REGISTRY)) {
      const seo = getSchoolSeo(slug, cfg, { name: slug, subdomain: slug });
      expect(seo.title.length).toBeLessThan(60);
      expect(seo.description.length).toBeLessThan(155);
      expect(`${seo.title} ${seo.description} ${seo.siteName}`).not.toMatch(BANNED);
    }
  });

  it("falls back to the campus pattern and the logo for a school without an seo block", () => {
    const cfg = {
      ...DEFAULT_ORG_CONFIG,
      branding: { ...DEFAULT_ORG_CONFIG.branding, wordmark: "Rice" },
    };
    const seo = getSchoolSeo("rice", cfg, { name: "Rice University", subdomain: "rice" });
    expect(seo.title).toBe("Find Your Co-Founder | Rice Co-Foundr Matching");
    expect(seo.description).toBe(DEFAULT_ORG_CONFIG.landing.subheadline);
    expect(seo.baseUrl).toBe("https://rice.mamuncofoundr.com");
    expect(seo.ogImage.url).toBe(DEFAULT_ORG_CONFIG.branding.logoUrl);
  });
});
