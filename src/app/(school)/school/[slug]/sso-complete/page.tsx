import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import { isEmailDomainAllowed } from "@/features/school/auth/email-domain";
import SessionRefreshRedirect from "@/features/school/components/auth/SessionRefreshRedirect";
import AutoRetry from "@/features/school/components/auth/AutoRetry";
import SignOutRedirect from "@/features/school/components/auth/SignOutOnMount";

export default async function SSOCompletePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId, sessionId } = await auth();

  if (!userId) {
    redirect(`/school/${slug}/sign-in`);
  }

  const org = await getOrganizationBySlug(slug);
  if (!org) {
    redirect("/");
  }

  const clerk = await clerkClient();

  let user: Awaited<ReturnType<typeof clerk.users.getUser>> | undefined;
  try {
    const { data: users } = await clerk.users.getUserList({ userId: [userId], limit: 1 });
    user = users[0];
  } catch (err) {
    console.error("sso-complete: getUserList failed, trying getUser", userId, err);
    try {
      user = await clerk.users.getUser(userId);
    } catch (err2) {
      console.error("sso-complete: getUser also failed", userId, err2);
      return <AutoRetry />;
    }
  }

  if (!user) {
    return <AutoRetry />;
  }

  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  )?.emailAddress;

  async function revokeSession() {
    if (!sessionId) return;
    try {
      await clerk.sessions.revokeSession(sessionId);
    } catch (err) {
      console.error("sso-complete: revokeSession failed", err);
    }
  }

  if (!primaryEmail) {
    await revokeSession();
    const signInUrl = `/school/${slug}/sign-in?mismatch=1`;
    return <SignOutRedirect redirectUrl={signInUrl} />;
  }

  if (!isEmailDomainAllowed(primaryEmail, org!.allowed_email_domains)) {
    await revokeSession();
    const params = new URLSearchParams({
      mismatch: "1",
      email: primaryEmail,
    });
    const signInUrl = `/school/${slug}/sign-in?${params}`;
    return <SignOutRedirect redirectUrl={signInUrl} />;
  }

  try {
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...(user.publicMetadata ?? {}),
        organization_id: org!.id,
      },
    });
  } catch (err) {
    console.error("sso-complete: updateUserMetadata failed", userId, err);
    return <AutoRetry />;
  }

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

  // Use per-org onboarding flag. Legacy fallback: treat global onboardingComplete
  // as school-done when the user's organization_id already matches this org
  // (users who onboarded before the per-context split was introduced).
  const schoolOnboarding = user.publicMetadata?.schoolOnboarding as
    | Record<string, boolean>
    | undefined;
  const schoolDone =
    schoolOnboarding?.[org!.id] === true ||
    (user.publicMetadata?.onboardingComplete === true &&
      user.publicMetadata?.organization_id === org!.id);
  const destination = schoolDone
    ? `/school/${slug}/dashboard`
    : `/school/${slug}/onboarding`;

  return <SessionRefreshRedirect to={destination} />;
}
