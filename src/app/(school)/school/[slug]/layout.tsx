import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import OrgHeaderSwitch from "@/features/school/components/OrgHeaderSwitch";
import { SchoolProvider } from "@/features/school/components/SchoolContext";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import { getOrgConfig, DEFAULT_ORG_CONFIG } from "@/features/school/registry/registry";
import { getVerifiedPrimaryEmail, getOrgAdminEmails } from "@/features/school/auth/org-admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  const cfg = getOrgConfig(slug) ?? DEFAULT_ORG_CONFIG;

  const orgName = org?.name ?? "School Portal";
  const description = cfg.landing.subheadline;
  const baseUrl =
    org?.subdomain
      ? `https://${org.subdomain}.mamuncofoundr.com`
      : process.env.NEXT_PUBLIC_APP_URL ?? "https://mamuncofoundr.com";
  const ogImage = cfg.landing.heroImageUrl ?? cfg.branding.logoUrl;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: orgName,
      template: `%s | ${orgName}`,
    },
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: baseUrl,
      siteName: orgName,
      title: orgName,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: orgName,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
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
        <OrgHeaderSwitch slug={slug} schoolName={org.name} config={cfg} isSignedIn={!!userId} isAdmin={isAdmin} />
        <main>{children}</main>
      </div>
    </SchoolProvider>
  );
}
