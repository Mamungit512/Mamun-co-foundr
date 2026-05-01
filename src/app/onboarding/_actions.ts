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
    // updateUserMetadata MERGES into existing publicMetadata (preserves organization_id
    // and any other fields set by the webhook). updateUser would overwrite everything.
    const res = await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    });
    return { message: res.publicMetadata };
  } catch (err) {
    console.error("The following error has occured: ", err);
    return { error: "There was an error updating the user metadata." };
  }
};
