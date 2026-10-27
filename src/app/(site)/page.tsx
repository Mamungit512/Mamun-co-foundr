import type { Metadata } from "next";

import Hero from "@/components/site/home/Hero";
import MatchingFeature from "@/components/site/home/MatchingFeature";
import Pivot from "@/components/site/home/Pivot";
import RoadmapBand from "@/components/site/home/RoadmapBand";
import TrustStrip from "@/components/site/home/TrustStrip";
import WhoSigns from "@/components/site/home/WhoSigns";
import WorkspaceFeature from "@/components/site/home/WorkspaceFeature";
import JsonLd from "@/components/site/seo/JsonLd";
import { ORGANIZATION, pageMetadata } from "@/content/site/seo";

export const metadata: Metadata = pageMetadata("home");

// Homepage — eight sections in the order of Main.dc.html: hero, credibility
// band (inside Hero), pivot, trust strip, matching, workspace, roadmap band,
// who signs.
export default function HomePage() {
  return (
    <>
      <JsonLd data={ORGANIZATION} />
      <Hero />
      <Pivot />
      <TrustStrip />
      <MatchingFeature />
      <WorkspaceFeature />
      <RoadmapBand />
      <WhoSigns />
    </>
  );
}
