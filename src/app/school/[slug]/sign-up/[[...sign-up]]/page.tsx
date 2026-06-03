import { notFound } from "next/navigation";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import SchoolSignUp from "@/features/school/components/auth/SchoolSignUp";

export default async function SchoolSignUpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  if (!org) notFound();

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <SchoolSignUp
        slug={org.slug}
        schoolName={org.name}
        allowedDomains={org.allowed_email_domains ?? []}
      />
    </div>
  );
}
