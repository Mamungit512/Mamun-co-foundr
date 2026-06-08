import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") ?? "mamuncofoundr.com";
  const baseUrl = `https://${host}`;

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
