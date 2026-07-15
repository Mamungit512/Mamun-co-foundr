import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import { getOrgConfig } from "@/features/school/registry/registry";
import Hero from "@/features/school/components/landing/Hero";
import HowItWorks from "@/features/school/components/landing/HowItWorks";
import ValuesPillars from "@/features/school/components/landing/ValuesPillars";
import CtaBand from "@/features/school/components/landing/CtaBand";
import DepartmentMosaic from "@/features/school/components/landing/DepartmentMosaic";
import WhyItWorks from "@/features/school/components/landing/WhyItWorks";

export default async function SchoolLanding({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  if (!org) notFound();

  const cfg = getOrgConfig(slug);
  if (!cfg) notFound();

  const baseUrl = `https://${org.subdomain ?? slug}.mamuncofoundr.com`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: cfg.branding.wordmark ?? org.name,
    url: baseUrl,
    logo: `${baseUrl}${cfg.branding.logoUrl}`,
    description: cfg.landing.subheadline,
  };

  const jsonLdScript = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );

  if (slug === "ut") {
    return (
      <>
        {jsonLdScript}
        <Hero />
        <WhyItWorks />
        <HowItWorks />
        <ValuesPillars />
        <CtaBand />
        <DepartmentMosaic />
      </>
    );
  }

  const { branding, landing } = cfg;

  return (
    <>
      {jsonLdScript}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      {landing.heroImageUrl && (
        <div className="absolute inset-0 -z-10 opacity-10">
          <Image
            src={landing.heroImageUrl}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}

      <Image
        src={branding.logoUrl}
        alt={branding.wordmark ?? org.name}
        width={120}
        height={120}
        className="mb-8 h-20 w-auto"
      />

      <h1 className="mb-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        {landing.headline}
      </h1>

      <p className="mb-10 max-w-xl text-lg opacity-70">
        {landing.subheadline}
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href={`/school/${slug}/sign-up`}
          className="rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md"
          style={{ backgroundColor: branding.primaryColor }}
        >
          {landing.ctaPrimaryLabel}
        </Link>
        <Link
          href={`/school/${slug}/sign-in`}
          className="rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
          style={{
            borderColor: branding.accentColor,
            color: branding.accentColor,
          }}
        >
          {landing.ctaSecondaryLabel}
        </Link>
      </div>
    </div>
    </>
  );
}
