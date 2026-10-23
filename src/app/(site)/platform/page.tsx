import type { Metadata } from "next";

import AdminTabMock from "@/components/site/platform/AdminTabMock";
import CofoundersTabMock from "@/components/site/platform/CofoundersTabMock";
import ConnectionsTabMock from "@/components/site/platform/ConnectionsTabMock";
import MatchTabMock from "@/components/site/platform/MatchTabMock";
import PlatformTabs from "@/components/site/platform/PlatformTabs";
import CtaBand from "@/components/site/ui/CtaBand";
import Eyebrow from "@/components/site/ui/Eyebrow";
import { BOOK_A_DEMO, CALENDLY_URL } from "@/content/site/shell";
import { PLATFORM_CTA, PLATFORM_HERO as H, PLATFORM_NOTE, toView } from "@/content/site/platform";
import { pageMetadata } from "@/content/site/seo";

export const metadata: Metadata = pageMetadata("platform");

type Props = { searchParams: Promise<{ view?: string }> };

// /platform — hero, four tabbed product screens (?view=), one CTA band.
export default async function PlatformPage({ searchParams }: Props) {
  const { view } = await searchParams;

  return (
    <>
      <section
        aria-labelledby="platform-title"
        className="box-content flex max-w-860 flex-col gap-18 px-gutter pt-fluid-72 pb-40"
      >
        <Eyebrow>{H.eyebrow}</Eyebrow>
        <h1 id="platform-title" className="text-ink type-display-4">
          {H.title}
        </h1>
        <p className="text-text-body type-body-17">{H.subline}</p>
      </section>

      <PlatformTabs
        initial={toView(view)}
        panels={{
          matching: <MatchTabMock />,
          connections: <ConnectionsTabMock />,
          cofounders: <CofoundersTabMock />,
          admin: <AdminTabMock />,
        }}
        // #8E8E85, not the prototype's #66665C, which fails AA on the dark band (§14).
        note={<p className="text-dk-muted type-caption-floor">{PLATFORM_NOTE}</p>}
      />

      <CtaBand
        id="platform-cta-title"
        heading={PLATFORM_CTA.title}
        measure="620"
        cta={{ href: CALENDLY_URL, label: BOOK_A_DEMO }}
      />
    </>
  );
}
