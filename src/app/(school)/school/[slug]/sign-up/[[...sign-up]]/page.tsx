import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import SchoolSignUp from "@/features/school/components/auth/SchoolSignUp";

export default async function SchoolSignUpPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { slug } = await params;
  const { redirect: redirectParam } = await searchParams;

  const { userId } = await auth();
  if (userId) {
    redirect(redirectParam || `/school/${slug}/dashboard`);
  }

  const org = await getOrganizationBySlug(slug);
  if (!org) notFound();

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div id="clerk-captcha" />
      <SchoolSignUp
        slug={org.slug}
        schoolName={org.name}
        allowedDomains={org.allowed_email_domains ?? []}
        afterAuthRedirect={redirectParam ?? null}
      />
    </div>
  );
}
