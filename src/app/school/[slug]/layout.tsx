import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SchoolHeader from "@/components/school/SchoolHeader";
import { SchoolProvider } from "@/components/school/SchoolContext";
import { getOrganizationBySlug } from "@/lib/organizations";
import { getOrgConfig, DEFAULT_ORG_CONFIG } from "@/orgs/registry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  const cfg = getOrgConfig(slug) ?? DEFAULT_ORG_CONFIG;

  return {
    title: org?.name ?? "School Portal",
    icons: cfg.branding.faviconUrl
      ? { icon: cfg.branding.faviconUrl }
      : undefined,
  };
}

export default async function SchoolSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);

  if (!org) {
    notFound();
  }

  const cfg = getOrgConfig(slug) ?? DEFAULT_ORG_CONFIG;

  return (
    <SchoolProvider slug={slug} schoolName={org.name} config={cfg}>
      <div
        style={
          {
            "--org-primary": cfg.branding.primaryColor,
            "--org-accent": cfg.branding.accentColor,
            "--org-bg": cfg.branding.backgroundColor,
            "--org-text": cfg.branding.textColor,
          } as React.CSSProperties
        }
        className="min-h-screen bg-[var(--org-bg)] text-[var(--org-text)]"
      >
        <SchoolHeader slug={slug} schoolName={org.name} config={cfg} />
        <main>{children}</main>
      </div>
    </SchoolProvider>
  );
}
