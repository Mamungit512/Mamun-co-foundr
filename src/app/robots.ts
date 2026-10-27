import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { SITE_URL } from "@/content/site/seo";

const APEX = new Set(["mamuncofoundr.com", "www.mamuncofoundr.com"]);

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") ?? "mamuncofoundr.com";
  // School subdomains keep their own sitemap; the apex points at the
  // canonical www one (spec §17).
  const baseUrl = APEX.has(host.split(":")[0].toLowerCase()) ? SITE_URL : `https://${host}`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/admin",
        "/onboarding",
        "/matches",
        "/messages",
        "/profile",
        "/edit-profile",
        "/sso-callback",
        "/sso-complete",
        "/pending-activation",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
