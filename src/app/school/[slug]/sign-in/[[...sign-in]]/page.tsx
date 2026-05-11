import { notFound } from "next/navigation";
import { getOrganizationBySlug } from "@/lib/organizations";
import SchoolSignIn from "@/components/school/auth/SchoolSignIn";

export default async function SchoolSignInPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  if (!org) notFound();

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <SchoolSignIn
        slug={org.slug}
        schoolName={org.name}
        allowedDomains={org.allowed_email_domains ?? []}
      />
    </div>
  );
}
