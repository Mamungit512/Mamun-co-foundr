import type { Metadata } from "next";

import PricingReached from "@/components/site/analytics/PricingReached";
import Button from "@/components/site/ui/Button";
import CtaBand from "@/components/site/ui/CtaBand";
import Eyebrow from "@/components/site/ui/Eyebrow";
import HairlineGrid from "@/components/site/ui/HairlineGrid";
import { CALENDLY_URL } from "@/content/site/shell";
import { INCLUDED, PRICING_CTA, PRICING_HERO as H, TIER_CTA, TIERS } from "@/content/site/pricing";
import { pageMetadata } from "@/content/site/seo";

export const metadata: Metadata = pageMetadata("pricing");

// /pricing — hero with the term panel, three enrollment tiers, what's
// included, one CTA band. Every quote CTA goes to Calendly (spec §11.1).
export default function PricingPage() {
  return (
    <>
      <section
        aria-labelledby="pricing-title"
        className="box-content flex max-w-820 flex-col gap-20 px-gutter pt-fluid-80 pb-56"
      >
        <Eyebrow>{H.eyebrow}</Eyebrow>
        <h1 id="pricing-title" className="text-ink type-display-3">
          {H.title}
        </h1>
        <p className="max-w-640 text-text-body type-body-lg">{H.subline}</p>
        <div className="flex gap-12 pt-6">
          <Button href={CALENDLY_URL} position="hero">
            {H.cta}
          </Button>
        </div>
        {/* Stacked on phones with horizontal rules; one row from tablet up. */}
        <dl data-card="" className="m-0 mt-14 grid grid-cols-1 rounded-card border border-rule-card md:grid-cols-3">
          {H.terms.map((term, i) => (
            <div
              key={term.label}
              className={`flex flex-col gap-5 px-22 py-18 ${
                i < H.terms.length - 1 ? "border-b border-rule-card md:border-r md:border-b-0" : ""
              }`}
            >
              <dt className="text-text-eyebrow type-label">{term.label}</dt>
              <dd className="m-0 text-text-strong type-info">{term.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="Tiers" className="px-gutter pb-72">
        <HairlineGrid columns={3}>
          {TIERS.map((tier) => {
            const dark = tier.featured;
            return (
              <div
                key={tier.name}
                className={`flex flex-col gap-22 px-34 py-38 ${dark ? "bg-ink" : "bg-white"}`}
              >
                <div className="flex flex-col gap-8">
                  <p className={`type-label-md ${dark ? "text-lime" : "text-text-eyebrow"}`}>{tier.label}</p>
                  <h2 className={`type-tier ${dark ? "text-white" : "text-ink"}`}>{tier.name}</h2>
                  <p className={`type-body-sm ${dark ? "text-dk-body" : "text-text-caption"}`}>{tier.band}</p>
                </div>
                <ul
                  className={`m-0 flex list-none flex-col gap-10 border-t p-0 pt-20 ${
                    dark ? "border-dark-rule" : "border-rule-soft"
                  }`}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className={`type-note ${dark ? "text-dk-strong" : "text-text-strong"}`}>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  href={CALENDLY_URL}
                  variant={dark ? "lime" : "secondary"}
                  size="tier"
                  position="tier"
                  className="mt-auto"
                >
                  {TIER_CTA}
                </Button>
              </div>
            );
          })}
        </HairlineGrid>
        <PricingReached />
      </section>

      <section
        aria-labelledby="included-title"
        className="grid grid-cols-1 gap-64 border-b border-rule bg-bone px-gutter py-fluid-72 md:grid-cols-2"
      >
        <div className="flex flex-col gap-16">
          <h2 id="included-title" className="text-ink type-head-7">
            {INCLUDED.title}
          </h2>
          <p className="text-text-muted type-roadmap-body">{INCLUDED.body}</p>
        </div>
        <HairlineGrid columns={1}>
          {INCLUDED.items.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-16 bg-white px-24 py-20">
              <span className="text-ink type-ledger">{item.label}</span>
              <span className="whitespace-nowrap text-lime-deep type-ledger-value">{item.value}</span>
            </div>
          ))}
        </HairlineGrid>
      </section>

      <CtaBand
        id="pricing-cta-title"
        heading={PRICING_CTA.title}
        measure="620"
        cta={{ href: CALENDLY_URL, label: PRICING_CTA.cta }}
      />
    </>
  );
}
