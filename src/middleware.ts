import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/careers",
  "/contact-us",
  "/mission",
  "/api/webhooks/clerk",
]);

// Helper function to update user activity in user_activity_summary table
async function updateUserActivity(userId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "Supabase credentials not configured for activity tracking",
      );
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date().toISOString();

    // Upsert to user_activity_summary table
    // This updates last_active_at in real-time while the cron job handles login counts
    const { error } = await supabase.from("user_activity_summary").upsert(
      {
        user_id: userId,
        last_active_at: now,
        updated_at: now,
      },
      {
        onConflict: "user_id",
        // Don't overwrite login counts that are managed by cron job
        ignoreDuplicates: false,
      },
    );

    if (error) {
      console.error("Error updating user activity:", error);
    }
  } catch (error) {
    console.error("Failed to update user activity:", error);
    // Don't throw - activity tracking should not break the request
  }
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // For users visiting /onboarding, don't try to redirect
  if (userId && isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!userId && !isPublicRoute(req))
    return redirectToSignIn({ returnBackUrl: req.url });

  // Catch users who do not have `onboardingComplete: true` in their publicMetadata
  // Redirect them to the /onboarding route to complete onboarding
  if (userId && !sessionClaims?.metadata?.onboardingComplete) {
    // Allow public routes and API requests to proceed so form submits don't break
    const isApiRoute = req.nextUrl.pathname.startsWith("/api/");
    if (isPublicRoute(req) || isApiRoute) {
      return NextResponse.next();
    }

    // For private, non-API routes, redirect to /onboarding page
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // Update user activity for authenticated users on protected routes
  // Skip for API routes, static assets, and webhooks to reduce DB load
  if (userId && !isPublicRoute(req)) {
    const isApiRoute = req.nextUrl.pathname.startsWith("/api/");
    const isStaticAsset = req.nextUrl.pathname.match(
      /\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/,
    );

    if (!isApiRoute && !isStaticAsset) {
      // Update activity asynchronously without blocking the response
      updateUserActivity(userId).catch(console.error);
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
