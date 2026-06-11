import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import { getOrgConfig } from "@/features/school/registry/registry";
import { getSchoolPolicyComponent } from "@/features/school/policies/index";
import {
  PrivacyPolicyDesktopTOC,
  PrivacyPolicyMobileTOC,
} from "@/features/school/policies/PrivacyPolicyTOC";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  const cfg = getOrgConfig(slug);
  const orgName = org?.name ?? "School Portal";
  const wordmark = cfg?.branding.wordmark ?? orgName;
  return {
    title: `Privacy Policy | ${wordmark} Co-Foundr`,
    description: `Privacy policy for the ${wordmark} Co-Foundr matching platform.`,
  };
}

export default async function SchoolPrivacyPolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [org, cfg] = await Promise.all([
    getOrganizationBySlug(slug),
    Promise.resolve(getOrgConfig(slug)),
  ]);

  if (!org || !cfg) notFound();

  const PolicyContent = getSchoolPolicyComponent(slug);
  if (!PolicyContent) notFound();

  const primaryColor = cfg.branding.primaryColor;
  const wordmark = cfg.branding.wordmark ?? org.name;
  const downloadUrl = cfg.privacyPolicy?.downloadUrl;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="lg:flex lg:gap-12 xl:gap-16">

          {/* Sticky sidebar TOC — desktop only */}
          <aside className="hidden lg:block lg:w-52 xl:w-56 shrink-0">
            <div className="sticky top-8 max-h-[calc(100vh-5rem)] overflow-y-auto pb-4">
              <PrivacyPolicyDesktopTOC primaryColor={primaryColor} />
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">

            {/* Mobile TOC */}
            <PrivacyPolicyMobileTOC primaryColor={primaryColor} />

            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-1 text-sm font-semibold" style={{ color: primaryColor }}>
                  {wordmark} Co-Foundr
                </p>
                <h1 className="text-3xl font-bold text-gray-900">
                  Privacy Policy
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  University Platform Edition — FERPA Compliant
                </p>
              </div>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download PDF
                </a>
              )}
            </div>

            {/* Divider */}
            <div className="mb-8 h-px" style={{ backgroundColor: primaryColor, opacity: 0.3 }} />

            {/* Policy content */}
            <PolicyContent primaryColor={primaryColor} />

            {/* Footer note */}
            <div className="mt-12 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
              © 2026 {wordmark} Co-Foundr. Powered by Mamun. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
