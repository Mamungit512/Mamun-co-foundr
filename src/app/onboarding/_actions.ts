// // --- This file lists the logic performed once the user completes and submits the onboarding flow form ---
// // --- Specifically it will update the Clerk user's "publicMetadata" to store the onboarding info provided by the user ---

"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const completeOnboarding = async (_formData: OnboardingData) => {
  const { userId } = await auth();

  if (!userId) {
    return { message: "No Logged In User" };
  }

  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        // Only store the flag to prevent JWT token overflow
        // Full profile data is stored in Supabase
      },
    });
    return { message: res.publicMetadata };
  } catch (err) {
    console.error("The following error has occured: ", err);
    return { error: "There was an error updating the user metadata." };
  }
};
