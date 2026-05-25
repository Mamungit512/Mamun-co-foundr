import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getOrganizationBySlug } from "@/lib/organizations";
import { isEmailDomainAllowed } from "@/lib/auth/email-domain";
import SessionRefreshRedirect from "@/components/school/auth/SessionRefreshRedirect";

export default async function SSOCompletePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/school/${slug}/sign-in`);
  }

  const org = await getOrganizationBySlug(slug);
  if (!org) {
    redirect("/");
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  )?.emailAddress;

  if (!primaryEmail) {
    return (
      <DomainMismatch
        slug={slug}
        orgName={org!.name}
        email="unknown"
        domains={org!.allowed_email_domains}
      />
    );
  }

  if (!isEmailDomainAllowed(primaryEmail, org!.allowed_email_domains)) {
    return (
      <DomainMismatch
        slug={slug}
        orgName={org!.name}
        email={primaryEmail}
        domains={org!.allowed_email_domains}
      />
    );
  }

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...(user.publicMetadata ?? {}),
      organization_id: org!.id,
    },
  });

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    await supabase
      .from("profiles")
      .update({ organization_id: org!.id })
      .eq("user_id", userId);
  } catch (err) {
    console.error("sso-complete: profile org update failed:", err);
  }

  const destination = user.publicMetadata?.onboardingComplete
    ? `/school/${slug}/dashboard`
    : `/school/${slug}/onboarding`;

  return <SessionRefreshRedirect to={destination} />;
}

function DomainMismatch({
  slug,
  orgName,
  email,
  domains,
}: {
  slug: string;
  orgName: string;
  email: string;
  domains: string[];
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#e8e4dc] bg-white p-8 shadow-sm">
        <h1
          className="mb-2 text-xl font-semibold"
          style={{ color: "#333f48" }}
        >
          This isn&apos;t your portal
        </h1>
        <p className="mb-4 text-sm" style={{ color: "#9cadb7" }}>
          You signed in as <strong>{email}</strong>, but {orgName} is restricted
          to {domains.map((d) => `@${d}`).join(", ")}.
        </p>
        <div className="space-y-2">
          <a
            href="https://www.mamuncofoundr.com"
            className="block rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#bf5700" }}
          >
            Go to mamuncofoundr.com
          </a>
          <Link
            href={`/school/${slug}/sign-in`}
            className="block rounded-lg border px-4 py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ borderColor: "#e8e4dc", color: "#333f48" }}
          >
            Try a different account
          </Link>
        </div>
      </div>
    </div>
  );
}
