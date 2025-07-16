// --- This file lists the logic performed once the user completes and submits the onboarding flow form ---
// --- Specifically it will update the Clerk user's "publicMetadata" to store the onboarding info provided by the user ---

"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { OnboardingData } from "./page";

export const completeOnboarding = async (formData: OnboardingData) => {
  const { userId } = await auth();

  if (!userId) {
    return { message: "No Logged In User" };
  }

  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        ...formData, // All collected onboarding data
      },
    });
    return { message: res.publicMetadata };
  } catch (err) {
    console.error("The following error has occured: ", err);
    return { error: "There was an error updating the user metadata." };
  }
};
