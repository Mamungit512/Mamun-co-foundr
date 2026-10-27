import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import OrgHeaderSwitch from "@/features/school/components/OrgHeaderSwitch";
import { SchoolProvider } from "@/features/school/components/SchoolContext";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import { getOrgConfig, DEFAULT_ORG_CONFIG } from "@/features/school/registry/registry";
import { getVerifiedPrimaryEmail, getOrgAdminEmails } from "@/features/school/auth/org-admin";
import PublicFooter from "@/features/school/components/landing/PublicFooter";
import { getSchoolSeo } from "@/features/school/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  const cfg = getOrgConfig(slug) ?? DEFAULT_ORG_CONFIG;
  const seo = getSchoolSeo(slug, cfg, org);

  return {
    metadataBase: new URL(seo.baseUrl),
    title: seo.title,
    description: seo.description,
    openGraph: {
      type: "website",
      url: seo.baseUrl,
      siteName: seo.siteName,
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage.url],
    },
    // FERPA: every page on a school subdomain is noindex — sign-in, the
    // logged-in app and student profiles. Only the public landing page opts
    // back in (page.tsx), and only it carries a canonical.
    robots: {
      index: false,
      follow: false,
    },
    icons: cfg.branding.faviconUrl
      ? { icon: `${seo.baseUrl}${cfg.branding.faviconUrl}` }
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
  const [{ userId, sessionClaims }, org] = await Promise.all([
    auth(),
    getOrganizationBySlug(slug),
  ]);

  if (!org) {
    notFound();
  }

  const cfg = getOrgConfig(slug) ?? DEFAULT_ORG_CONFIG;

  let isAdmin = false;
  if (userId) {
    const orgId = sessionClaims?.metadata?.organization_id as string | undefined;
    if (orgId) {
      const [email, adminEmails] = await Promise.all([
        getVerifiedPrimaryEmail(userId),
        getOrgAdminEmails(orgId),
      ]);
      if (email) {
        isAdmin = adminEmails.includes(email.toLowerCase());
      }
    }
  }

  return (
    <SchoolProvider slug={slug} orgId={org.id} schoolName={org.name} config={cfg}>
      <div
        style={
          {
            "--org-primary": cfg.branding.primaryColor,
            "--org-accent": cfg.branding.accentColor,
            "--org-bg": cfg.branding.backgroundColor,
            "--org-text": cfg.branding.textColor,
            // Semantic UI tokens — light-mode overrides for school orgs with white bg.
            // Text/subtle values are chosen to clear WCAG AA (4.5:1) on white — see
            // the plan doc for the full contrast audit.
            ...(cfg.branding.backgroundColor === "#FFFFFF" ||
            cfg.branding.backgroundColor === "#ffffff"
              ? {
                  "--ui-bg": "#ffffff",
                  "--ui-text": cfg.branding.textColor,
                  "--ui-text-muted": "#5f7280",
                  "--ui-text-subtle": "#64757e",
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
        className="flex min-h-screen flex-col bg-[var(--org-bg)] text-[var(--org-text)]"
      >
        <OrgHeaderSwitch slug={slug} schoolName={org.name} config={cfg} isSignedIn={!!userId} isAdmin={isAdmin} />
        <main className="flex flex-1 flex-col">{children}</main>
        <PublicFooter slug={slug} />
      </div>
    </SchoolProvider>
  );
}
