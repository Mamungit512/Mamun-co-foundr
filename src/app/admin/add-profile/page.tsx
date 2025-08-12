// import { redirect } from "next/navigation";
import OnboardingComponent from "@/app/onboarding/page";

import { isUserAdmin } from "@/features/auth/authService";
import { auth } from "@clerk/nextjs/server";

export default async function AdminAddProfilePage() {
  // Get user session server-side via Clerk
  const { userId, getToken } = await auth();

  if (!userId) {
    // redirect("/sign-in");
    return <div>Unauthorized. Please Sign In</div>;
  }

  const token = await getToken();

  if (!token) {
    console.error("Invalid token");
    return <div>Unauthorized. Please Sign In</div>
  }

  const admin = await isUserAdmin(userId, token);

  if (!admin) return <p>Access denied. Admins only.</p>;

  return <OnboardingComponent />;
}
