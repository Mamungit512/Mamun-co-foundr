import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import SchoolResetPassword from "@/features/school/components/auth/SchoolResetPassword";

export default async function SchoolResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ email?: string; redirect?: string }>;
}) {
  const { slug } = await params;
  const { email, redirect: redirectParam } = await searchParams;

  const { userId } = await auth();
  if (userId) {
    redirect(redirectParam || `/school/${slug}/dashboard`);
  }

  const org = await getOrganizationBySlug(slug);
  if (!org) notFound();

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <SchoolResetPassword
        slug={org.slug}
        schoolName={org.name}
        allowedDomains={org.allowed_email_domains ?? []}
        initialEmail={email ?? ""}
        afterAuthRedirect={redirectParam ?? null}
      />
    </div>
  );
}
