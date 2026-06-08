import { notFound } from "next/navigation";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import SchoolSignIn from "@/features/school/components/auth/SchoolSignIn";

export default async function SchoolSignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mismatch?: string; email?: string; redirect?: string }>;
}) {
  const { slug } = await params;
  const { mismatch, email, redirect } = await searchParams;
  const org = await getOrganizationBySlug(slug);
  if (!org) notFound();

  let initialError: string | null = null;
  if (mismatch === "1") {
    const emailPart = email ? ` You signed in as ${email}.` : "";
    initialError = `This isn't your portal.${emailPart} ${org.name} requires a ${(org.allowed_email_domains ?? []).map((d) => `@${d}`).join(" or ")} email.`;
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <SchoolSignIn
        slug={org.slug}
        schoolName={org.name}
        allowedDomains={org.allowed_email_domains ?? []}
        initialError={initialError}
        afterAuthRedirect={redirect ?? null}
      />
    </div>
  );
}
