import type { Metadata } from "next";

import PartnerForm from "@/components/site/partner/PartnerForm";
import PartnerIntro from "@/components/site/partner/PartnerIntro";
import StatBand from "@/components/site/partner/StatBand";
import { pageMetadata } from "@/content/site/seo";

export const metadata: Metadata = pageMetadata("partner");

// /partner — not in the header nav; reached from the footer's
// "Security & FERPA" link. Wide-left split, then the stat band.
export default function PartnerPage() {
  return (
    <>
      <section
        aria-labelledby="partner-title"
        className="grid grid-cols-1 border-b border-rule md:grid-cols-2 lg:grid-cols-partner"
      >
        <PartnerIntro />
        <div className="flex flex-col border-t border-rule bg-bone px-gutter py-fluid-80 md:border-t-0 md:border-l">
          <PartnerForm />
        </div>
      </section>
      <StatBand />
    </>
  );
}
