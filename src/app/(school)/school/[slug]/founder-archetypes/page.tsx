import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import { getOrgConfig } from "@/features/school/registry/registry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  const cfg = getOrgConfig(slug);
  const wordmark = cfg?.branding.wordmark ?? org?.name ?? "School Portal";
  return {
    title: `Founder Archetypes | ${wordmark} Co-Foundr`,
    description:
      "Understand the three founder archetypes: The Scaler, The Steward, and The Architect. Find your founding style.",
  };
}

const ARCHETYPES = [
  {
    id: "the_scaler",
    name: "The Scaler",
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
        body: "To build a sustainable business that reflects core moral and ethical values.",
      },
      {
        label: "Core Value",
        title: "Integrity Over Speed",
        body: "Ensuring every partnership and transaction aligns with moral standards.",
      },
      {
        label: "Operational Moat",
        title: "Trust & Community",
        body: "Relying on deep relational networks and a shared standard of conduct across partners.",
      },
      {
        label: "Success Metric",
        title: "Social & Community ROI",
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
        body: "Every new participant makes the system more valuable for everyone else (e.g., Salesforce, Microsoft, or a global payments network).",
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

export default async function SchoolFounderArchetypesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [{ sessionClaims }, org] = await Promise.all([
    auth(),
    getOrganizationBySlug(slug),
  ]);
  const cfg = getOrgConfig(slug);

  if (!org || !cfg) notFound();

  const wordmark = cfg.branding.wordmark ?? org.name;

  // Per-org onboarding flag keyed by org UUID, with the same legacy fallback the
  // middleware uses for users who onboarded before the per-context split.
  const schoolOnboarding = sessionClaims?.metadata?.schoolOnboarding;
  const schoolDone =
    schoolOnboarding?.[org.id] === true ||
    (sessionClaims?.metadata?.onboardingComplete === true &&
      sessionClaims?.metadata?.organization_id === org.id);

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="border-b border-[var(--ui-border)] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-semibold tracking-widest text-[var(--ui-text-subtle)] uppercase">
            {wordmark} Co-Foundr
          </p>
          <h1 className="mb-5 text-4xl font-bold leading-tight text-[var(--ui-text)] md:text-5xl lg:text-6xl">
            Founder Archetypes
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--ui-text-muted)] md:text-lg">
            Every founder approaches building differently. These three archetypes
            capture distinct philosophies, from hypergrowth to values-led to
            ecosystem-first. Understanding yours helps you find the right
            co-founder.
          </p>
          {!schoolDone && (
            <Link
              href={`/school/${slug}/onboarding`}
              className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[var(--ui-border-strong)] px-5 py-2.5 text-sm font-medium text-[var(--ui-text-muted)] transition-all duration-200 hover:border-[var(--ui-text-muted)] hover:text-[var(--ui-text)]"
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
              className="flex flex-col overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)]"
            >
              {/* Card header */}
              <div className="border-b border-[var(--ui-border)] p-7">
                <div className="mb-4 flex items-start justify-between">
                  <span className="text-xs font-medium tracking-widest text-[var(--ui-text-subtle)] uppercase">
                    {archetype.index}
                  </span>
                </div>
                <h2 className="mb-1 text-2xl font-bold text-[var(--ui-text)]">
                  {archetype.name}
                </h2>
                <p className="mb-4 text-sm font-medium text-[var(--ui-text-muted)]">
                  {archetype.subtitle}
                </p>
                <p className="text-sm leading-relaxed text-[var(--ui-text-muted)]">
                  {archetype.description}
                </p>
              </div>

              {/* Dimensions */}
              <div className="flex flex-1 flex-col divide-y divide-[var(--ui-border)] p-7 pt-0">
                {archetype.dimensions.map((dim) => (
                  <div key={dim.label} className="py-4 first:pt-6">
                    <p className="mb-0.5 text-[10px] font-semibold tracking-widest text-[var(--ui-text-subtle)] uppercase">
                      {dim.label}
                    </p>
                    <p className="mb-1 text-sm font-semibold text-[var(--ui-text)]">
                      {dim.title}
                    </p>
                    <p className="text-xs leading-relaxed text-[var(--ui-text-muted)]">
                      {dim.body}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer CTA — only shown before school onboarding is complete */}
      {!schoolDone && (
        <section className="border-t border-[var(--ui-border)] px-6 py-16 text-center">
          <p className="mb-2 text-sm text-[var(--ui-text-muted)]">
            Ready to set your archetype?
          </p>
          <Link
            href={`/school/${slug}/onboarding`}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--ui-btn-bg)] px-6 py-3 text-sm font-semibold text-[var(--ui-btn-text)] transition-all duration-200 hover:opacity-90"
          >
            Continue onboarding →
          </Link>
        </section>
      )}
    </div>
  );
}
