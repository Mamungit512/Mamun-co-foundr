import { notFound } from "next/navigation";
import Link from "next/link";
import { FaEnvelopeOpen } from "react-icons/fa";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import { formatAllowedDomainsForCopy } from "@/features/school/auth/email-domain";

export default async function NotAuthorizedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  if (!org) notFound();

  const domainCopy = formatAllowedDomainsForCopy(org.allowed_email_domains);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ui-surface)]">
        <FaEnvelopeOpen className="h-8 w-8 text-[var(--ui-text-muted)]" />
      </div>

      <div className="max-w-sm space-y-2">
        <h1 className="text-2xl font-bold text-[var(--ui-text)]">
          School email required
        </h1>
        <p className="text-sm leading-relaxed text-[var(--ui-text-muted)]">
          This portal is only available to {org.name} students and faculty.
          {domainCopy && (
            <>
              {" "}You need a{" "}
              <span className="font-semibold text-[var(--ui-text)]">
                {domainCopy}
              </span>{" "}
              email address to access this site.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Link
          href={`/school/${slug}/sign-up`}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--org-primary)" }}
        >
          Sign up with your school email
        </Link>
        <Link
          href={`/school/${slug}/sign-in`}
          className="text-sm text-[var(--ui-text-muted)] underline underline-offset-4 hover:text-[var(--ui-text)]"
        >
          Already have an account? Sign in
        </Link>
        <Link
          href="https://www.mamuncofoundr.com"
          className="text-xs text-[var(--ui-text-subtle)] hover:text-[var(--ui-text-muted)]"
        >
          Go to the main Mamun platform →
        </Link>
      </div>
    </div>
  );
}
