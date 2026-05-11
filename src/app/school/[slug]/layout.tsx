import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import OrgHeaderSwitch from "@/components/school/OrgHeaderSwitch";
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
  const [{ userId }, org] = await Promise.all([
    auth(),
    getOrganizationBySlug(slug),
  ]);

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
            // Semantic UI tokens — light-mode overrides for school orgs with white bg
            ...(cfg.branding.backgroundColor === "#FFFFFF" ||
            cfg.branding.backgroundColor === "#ffffff"
              ? {
                  "--ui-text": cfg.branding.textColor,
                  "--ui-text-muted": "#9cadb7",
                  "--ui-text-subtle": "rgba(51,63,72,0.45)",
                  "--ui-border": "#e8e4dc",
                  "--ui-border-strong": "#c8c3b8",
                  "--ui-surface": "rgba(51,63,72,0.04)",
                  "--ui-surface-active": "rgba(191,87,0,0.08)",
                  "--ui-btn-bg": cfg.branding.primaryColor,
                  "--ui-btn-text": "#ffffff",
                  "--ui-popover-bg": "#ffffff",
                }
              : {}),
          } as React.CSSProperties
        }
        className="min-h-screen bg-[var(--org-bg)] text-[var(--org-text)]"
      >
        <OrgHeaderSwitch slug={slug} schoolName={org.name} config={cfg} isSignedIn={!!userId} />
        <main>{children}</main>
      </div>
    </SchoolProvider>
  );
}
