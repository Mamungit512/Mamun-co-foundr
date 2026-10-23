import type { Metadata } from "next";

import FirstCheck from "@/components/site/matching/FirstCheck";
import MatchingHero from "@/components/site/matching/MatchingHero";
import ShipsWith from "@/components/site/matching/ShipsWith";
import WorkspaceMock from "@/components/site/mocks/WorkspaceMock";
import CtaBand from "@/components/site/ui/CtaBand";
import { BOOK_A_DEMO, CALENDLY_URL } from "@/content/site/shell";
import JsonLd from "@/components/site/seo/JsonLd";
import { MATCHING_CTA } from "@/content/site/matching";
import { pageMetadata, SOFTWARE_APPLICATION } from "@/content/site/seo";

export const metadata: Metadata = pageMetadata("matching");

// /matching — hero, dark band with the workspace mock, what ships, the
// first-check argument, then the page's one CTA band.
export default function MatchingPage() {
  return (
    <>
      <JsonLd data={SOFTWARE_APPLICATION} />
      <MatchingHero />
      <section aria-label="Co-founder workspace" className="bg-dark px-gutter py-fluid-28">
        <WorkspaceMock />
      </section>
      <ShipsWith />
      <FirstCheck />
      <CtaBand
        id="matching-cta-title"
        heading={MATCHING_CTA.title}
        cta={{ href: CALENDLY_URL, label: BOOK_A_DEMO }}
      />
    </>
  );
}
