import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getOrganizationBySlug } from "@/lib/organizations";
import { getOrgConfig } from "@/orgs/registry";

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

  const { branding, landing } = cfg;

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 py-20 text-center">
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
          href="/sign-up"
          className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: branding.primaryColor }}
        >
          {landing.ctaPrimaryLabel}
        </Link>
        <Link
          href="/sign-in"
          className="rounded-lg border px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{
            borderColor: branding.accentColor,
            color: branding.accentColor,
          }}
        >
          {landing.ctaSecondaryLabel}
        </Link>
      </div>
    </div>
  );
}
