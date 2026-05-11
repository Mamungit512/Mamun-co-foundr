"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getOrganizationBySlug } from "@/lib/organizations";
import { isEmailDomainAllowed } from "@/lib/auth/email-domain";

export type ExistingUserInfo = {
  exists: boolean;
  hasPassword: boolean;
  oauthProviders: string[];
};

export async function checkExistingUser(
  email: string,
): Promise<ExistingUserInfo> {
  const empty: ExistingUserInfo = {
    exists: false,
    hasPassword: false,
    oauthProviders: [],
  };
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) return empty;

  try {
    const clerk = await clerkClient();
    const result = await clerk.users.getUserList({
      emailAddress: [trimmed],
      limit: 1,
    });
    if (result.totalCount === 0) return empty;
    const user = result.data[0];
    return {
      exists: true,
      hasPassword: Boolean(user.passwordEnabled),
      oauthProviders: user.externalAccounts.map((a) => a.provider),
    };
  } catch (err) {
    console.error("checkExistingUser error:", err);
    return empty;
  }
}

export async function assignSchoolOrg(
  slug: string,
): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated." };

  const org = await getOrganizationBySlug(slug);
  if (!org) return { error: "Organization not found." };

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  );
  const email = primary?.emailAddress;
  if (!email) return { error: "No email on account." };

  if (!isEmailDomainAllowed(email, org.allowed_email_domains)) {
    return {
      error: `This account's email is not eligible for ${org.name}.`,
    };
  }

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...(user.publicMetadata ?? {}),
      organization_id: org.id,
    },
  });

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    await supabase
      .from("profiles")
      .update({ organization_id: org.id })
      .eq("user_id", userId);
  } catch (err) {
    console.error("assignSchoolOrg: failed to update profile org:", err);
  }

  return { success: true };
}
