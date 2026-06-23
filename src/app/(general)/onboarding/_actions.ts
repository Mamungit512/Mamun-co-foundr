"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

type OnboardingContext =
  | { kind: "general" }
  | { kind: "school"; orgId: string };

export const completeOnboarding = async (
  _formData: OnboardingData,
  ctx: OnboardingContext = { kind: "general" },
) => {
  const { userId } = await auth();

  if (!userId) {
    return { message: "No Logged In User" };
  }

  const client = await clerkClient();

  try {
    if (ctx.kind === "general") {
      // updateUserMetadata MERGES into existing publicMetadata (preserves organization_id
      // and any other fields set by the webhook). updateUser would overwrite everything.
      const res = await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          onboardingComplete: true,
        },
      });
      return { message: res.publicMetadata };
    } else {
      // School onboarding: merge into the schoolOnboarding map keyed by org UUID.
      // Must read existing value first — updateUserMetadata replaces nested objects wholesale.
      const user = await client.users.getUser(userId);
      const existing =
        (user.publicMetadata?.schoolOnboarding as Record<string, boolean> | undefined) ?? {};
      const res = await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          schoolOnboarding: { ...existing, [ctx.orgId]: true },
        },
      });
      return { message: res.publicMetadata };
    }
  } catch (err) {
    console.error("The following error has occured: ", err);
    return { error: "There was an error updating the user metadata." };
  }
};
