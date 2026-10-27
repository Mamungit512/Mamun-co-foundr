import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { PAGES, SITE_URL } from "@/content/site/seo";

const APEX = new Set([
  "mamuncofoundr.com",
  "www.mamuncofoundr.com",
  "localhost",
]);

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

  // The marketing site: its five routes, on the canonical www host (spec §13, §17).
  return Object.values(PAGES).map(({ path }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.6,
  }));
}
