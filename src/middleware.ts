import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isSchoolOnboardingRoute = createRouteMatcher([
  "/school/:slug/onboarding(.*)",
]);
const isSchoolRoute = createRouteMatcher(["/school/:slug(.*)"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/careers",
  "/contact-us",
  "/mission",
  "/privacy-policy",
  "/refund-policy",
  "/pricing",
  "/api/webhooks/clerk",
]);

type OrgRecord = { slug: string; ferpa_dpa_signed_at: string | null };

// Helper: resolve organization slug and DPA status from org UUID via Supabase
async function resolveOrgRecord(organizationId: string): Promise<OrgRecord | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from("organizations")
      .select("slug, ferpa_dpa_signed_at")
      .eq("id", organizationId)
      .single();

    return data ?? null;
  } catch {
    return null;
  }
}

// Helper: update user activity asynchronously
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

    const { error } = await supabase.from("user_activity_summary").upsert(
      {
        user_id: userId,
        last_active_at: now,
        updated_at: now,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: false,
      },
    );

    if (error) {
      console.error("Error updating user activity:", error);
    }
  } catch (error) {
    console.error("Failed to update user activity:", error);
  }
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const pathname = req.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");
  const isStaticAsset = /\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2?|ttf)$/.test(
    pathname,
  );

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (userId) {
    const orgId = sessionClaims?.metadata?.organization_id;

    // ----------------------------------------------------------------
    // SCHOOL USERS
    // ----------------------------------------------------------------
    if (orgId) {
      // Allow onboarding, API routes, and public routes to pass through
      if (isApiRoute || isPublicRoute(req)) {
        return NextResponse.next();
      }

      // If the user is on a school route already, let onboarding pass first
      if (isSchoolOnboardingRoute(req)) {
        return NextResponse.next();
      }

      // Resolve the org slug (also validates FERPA DPA)
      const org = await resolveOrgRecord(orgId);

      if (!org) {
        // Organization not found — deny access gracefully
        const url = new URL("/", req.url);
        return NextResponse.redirect(url);
      }

      // FERPA gate: DPA must be signed before any student can use the app
      if (!org.ferpa_dpa_signed_at) {
        const pendingUrl = new URL(
          `/school/${org.slug}/pending-activation`,
          req.url,
        );
        if (pathname !== pendingUrl.pathname) {
          return NextResponse.redirect(pendingUrl);
        }
        return NextResponse.next();
      }

      // Onboarding gate for school users
      if (!sessionClaims?.metadata?.onboardingComplete) {
        const schoolOnboardingUrl = new URL(
          `/school/${org.slug}/onboarding`,
          req.url,
        );
        if (pathname !== schoolOnboardingUrl.pathname) {
          return NextResponse.redirect(schoolOnboardingUrl);
        }
        return NextResponse.next();
      }

      // School user trying to access a general route → redirect to school dashboard
      if (!isSchoolRoute(req)) {
        const dashboardUrl = new URL(
          `/school/${org.slug}/dashboard`,
          req.url,
        );
        return NextResponse.redirect(dashboardUrl);
      }

      // Already on a school route — proceed
      if (!isApiRoute && !isStaticAsset) {
        updateUserActivity(userId).catch(console.error);
      }
      return NextResponse.next();
    }

    // ----------------------------------------------------------------
    // GENERAL USERS
    // ----------------------------------------------------------------

    // Allow onboarding route for users who haven't completed it
    if (isOnboardingRoute(req)) {
      return NextResponse.next();
    }

    // General user trying to access a school route → redirect to general dashboard
    if (isSchoolRoute(req) && !isApiRoute) {
      const dashboardUrl = new URL("/cofoundr-matching", req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Onboarding gate
    if (!sessionClaims?.metadata?.onboardingComplete) {
      if (isPublicRoute(req) || isApiRoute) {
        return NextResponse.next();
      }
      const onboardingUrl = new URL("/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    }

    // Update activity for protected, non-API, non-static routes
    if (!isPublicRoute(req) && !isApiRoute && !isStaticAsset) {
      updateUserActivity(userId).catch(console.error);
    }

    return NextResponse.next();
  }

  // Public routes — no auth required
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
