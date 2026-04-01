import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Founder Archetypes — Mamun",
  description:
    "Understand the three founder archetypes: The Scalar, The Steward, and The Architect. Find your founding style.",
};

const ARCHETYPES = [
  {
    id: "the_scalar",
    name: "The Scalar",
    subtitle: "AI-First Hypergrowth",
    description:
      "Wins markets through speed, algorithmic efficiency, and bold bets on exponential growth. Every decision optimizes for scale.",
    index: "01",
    dimensions: [
      {
        label: "Primary Goal",
        title: "Market Dominance",
        body: "To win the market through speed and technical efficiency.",
      },
      {
        label: "Core Value",
        title: "Speed Over Perfection",
        body: "Testing, breaking things, and iterating weekly to find product-market fit.",
      },
      {
        label: "Operational Moat",
        title: "Algorithmic Advantage",
        body: "Using proprietary data and AI agents to scale without adding headcount.",
      },
      {
        label: "Success Metric",
        title: "WoW Growth",
        body: "10–15% week-over-week revenue or user growth is the non-negotiable benchmark.",
      },
      {
        label: "Risk Tolerance",
        title: "High Ambition",
        body: "Taking bold, experimental bets with a high tolerance for failure if the payoff is massive.",
      },
      {
        label: "User Philosophy",
        title: "Users as Data",
        body: "Users provide the signals needed to pivot the product toward peak efficiency.",
      },
    ],
  },
  {
    id: "the_steward",
    name: "The Steward",
    subtitle: "Ethical / Values-Driven",
    description:
      "Builds sustainable businesses grounded in moral integrity, community trust, and long-term impact. Every partnership must align with values.",
    index: "02",
    dimensions: [
      {
        label: "Primary Goal",
        title: "Legacy & Impact",
        body: "To build a sustainable business that reflects core moral or faith-based values.",
      },
      {
        label: "Core Value",
        title: "Integrity Over Speed",
        body: "Ensuring every partnership and transaction aligns with moral standards.",
      },
      {
        label: "Operational Moat",
        title: "Trust & Community",
        body: 'Relying on deep relational networks and a shared moral "Silk Road."',
      },
      {
        label: "Success Metric",
        title: "Social & Spiritual ROI",
        body: "Measuring success by community well-being and adherence to ethical guardrails.",
      },
      {
        label: "Risk Tolerance",
        title: "Calculated Caution",
        body: "Favoring proven, sustainable practices that protect the reputation of the community.",
      },
      {
        label: "User Philosophy",
        title: "Users as Partners",
        body: "Users are members of a collective ecosystem built on mutual benefit.",
      },
    ],
  },
  {
    id: "the_architect",
    name: "The Architect",
    subtitle: "Ecosystem-Driven",
    description:
      "Builds the infrastructure and platforms where other businesses live. Success is measured by the total value generated across the ecosystem.",
    index: "03",
    dimensions: [
      {
        label: "Primary Goal",
        title: "Infrastructure",
        body: 'To become the "operating system" or the environment where other businesses live.',
      },
      {
        label: "Core Value",
        title: "Interdependence",
        body: "Believing that the success of the platform depends on the success of its third-party members.",
      },
      {
        label: "Operational Moat",
        title: "Network Effects",
        body: "Every new participant makes the system more valuable for everyone else (e.g., Salesforce, Microsoft, or a global Digital Silk Road).",
      },
      {
        label: "Success Metric",
        title: "Total Ecosystem Value",
        body: "Measuring success by how much commerce or value is generated on the platform, not just by it.",
      },
      {
        label: "Risk Tolerance",
        title: "Complex Stability",
        body: "A willingness to trade short-term rapid growth for long-term structural dominance and reliability.",
      },
      {
        label: "User Philosophy",
        title: "Users as Co-Creators",
        body: "Users aren't just consumers or data points; they are developers, sellers, and partners.",
      },
    ],
  },
] as const;

export default async function FounderArchetypesPage() {
  const { sessionClaims } = await auth();
  const onboardingComplete = sessionClaims?.metadata?.onboardingComplete === true;

  return (
    <main className="min-h-screen bg-(--charcoal-black) text-(--mist-white)">
      {/* Hero */}
      <section className="border-b border-white/6 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-semibold tracking-widest text-white/35 uppercase">
            Mamun Profile
          </p>
          <h1 className="mb-5 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Founder Archetypes
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/50 md:text-lg">
            Every founder approaches building differently. These three archetypes
            capture distinct philosophies — from hypergrowth to values-led to
            ecosystem-first. Understanding yours helps you find the right
            co-founder.
          </p>
          {!onboardingComplete && (
            <Link
              href="/onboarding"
              className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white/60 transition-all duration-200 hover:border-white/30 hover:text-white"
            >
              ← Back to onboarding
            </Link>
          )}
        </div>
      </section>

      {/* Archetype cards */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
          {ARCHETYPES.map((archetype) => (
            <article
              key={archetype.id}
              className="flex flex-col rounded-2xl border border-white/8 bg-white/3 overflow-hidden"
            >
              {/* Card header */}
              <div className="border-b border-white/8 p-7">
                <div className="mb-4 flex items-start justify-between">
                  <span className="text-xs font-medium tracking-widest text-white/20 uppercase">
                    {archetype.index}
                  </span>
                </div>
                <h2 className="mb-1 text-2xl font-bold text-white">
                  {archetype.name}
                </h2>
                <p className="mb-4 text-sm font-medium text-white/40">
                  {archetype.subtitle}
                </p>
                <p className="text-sm leading-relaxed text-white/55">
                  {archetype.description}
                </p>
              </div>

              {/* Dimensions */}
              <div className="flex flex-1 flex-col divide-y divide-white/5 p-7 pt-0">
                {archetype.dimensions.map((dim) => (
                  <div key={dim.label} className="py-4 first:pt-6">
                    <p className="mb-0.5 text-[10px] font-semibold tracking-widest text-white/25 uppercase">
                      {dim.label}
                    </p>
                    <p className="mb-1 text-sm font-semibold text-white/80">
                      {dim.title}
                    </p>
                    <p className="text-xs leading-relaxed text-white/45">
                      {dim.body}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer CTA — only shown during onboarding */}
      {!onboardingComplete && (
        <section className="border-t border-white/6 px-6 py-16 text-center">
          <p className="mb-2 text-sm text-white/40">
            Ready to set your archetype?
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-white/90"
          >
            Continue onboarding →
          </Link>
        </section>
      )}
    </main>
  );
}
