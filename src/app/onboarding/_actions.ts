// --- This file lists the logic performed once the user completes and submits the onboarding flow form ---
// --- Specifically it will update the Clerk user's "publicMetadata" ---

"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export const completeOnboarding = async (formData: FormData) => {
  const { userId } = await auth();

  if (!userId) {
    return { message: "No Logged In User" };
  }

  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        applicationName: formData.get("applicationName"),
        applicationType: formData.get("applicationType"),
      },
    });
    return { message: res.publicMetadata };
  } catch (err) {
    console.error("The following error has occured: ", err);
    return { error: "There was an error updating the user metadata." };
  }
};
