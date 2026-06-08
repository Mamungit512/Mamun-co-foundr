import type { MetadataRoute } from "next";
import { headers } from "next/headers";

const APEX = new Set([
  "mamuncofoundr.com",
  "www.mamuncofoundr.com",
  "localhost",
]);

const APEX_PUBLIC_PATHS = [
  "",
  "/pricing",
  "/careers",
  "/contact-us",
  "/founder-archetypes",
  "/privacy-policy",
  "/refund-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get("host") ?? "mamuncofoundr.com";
  const bare = host.split(":")[0].toLowerCase();
  const base = `https://${host}`;
  const isApex =
    APEX.has(bare) ||
    bare.endsWith(".vercel.app") ||
    bare.split(".").length < 3;

  if (!isApex) {
    return [
      {
        url: `${base}/`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }

  return APEX_PUBLIC_PATHS.map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.6,
  }));
}
