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
  "/founder-archetypes",
  "/api/webhooks/clerk",
  "/school/:slug",
]);

type OrgRecord = {
  id: string;
  slug: string;
  subdomain: string | null;
  ferpa_dpa_signed_at: string | null;
};

const APEX_HOSTS = new Set([
  "mamuncofoundr.com",
  "www.mamuncofoundr.com",
  "localhost",
]);

function isApexHost(host: string): boolean {
  const bare = host.split(":")[0].toLowerCase();
  return APEX_HOSTS.has(bare) || bare.endsWith(".vercel.app");
}

function getSubdomain(host: string): string | null {
  const bare = host.split(":")[0].toLowerCase();
  if (isApexHost(bare)) return null;
  const parts = bare.split(".");
  return parts.length >= 3 ? parts[0] : null;
}

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function resolveOrgBySubdomain(subdomain: string): Promise<OrgRecord | null> {
  try {
    const supabase = supabaseAdmin();
    if (!supabase) return null;
    const { data } = await supabase
      .from("organizations")
      .select("id, slug, subdomain, ferpa_dpa_signed_at")
      .eq("subdomain", subdomain)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

async function resolveOrgRecord(organizationId: string): Promise<OrgRecord | null> {
  try {
    const supabase = supabaseAdmin();
    if (!supabase) return null;
    const { data } = await supabase
      .from("organizations")
      .select("id, slug, subdomain, ferpa_dpa_signed_at")
      .eq("id", organizationId)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

async function updateUserActivity(userId: string) {
  try {
    const supabase = supabaseAdmin();
    if (!supabase) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from("user_activity_summary").upsert(
      { user_id: userId, last_active_at: now, updated_at: now },
      { onConflict: "user_id", ignoreDuplicates: false },
    );
    if (error) console.error("Error updating user activity:", error);
  } catch (error) {
    console.error("Failed to update user activity:", error);
  }
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const pathname = req.nextUrl.pathname;
  const host = req.headers.get("host") ?? "";
  const isApiRoute = pathname.startsWith("/api/");
  const isStaticAsset = /\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2?|ttf)$/.test(pathname);

  // ----------------------------------------------------------------
  // SUBDOMAIN REWRITE
  // Runs before auth so the rest of the middleware sees /school/{slug}/*
  // ----------------------------------------------------------------
  const subdomain = getSubdomain(host);
  if (subdomain && !isApiRoute && !isStaticAsset) {
    const hostOrg = await resolveOrgBySubdomain(subdomain);

    if (!hostOrg) {
      // Unknown subdomain — send to apex
      return NextResponse.redirect(new URL("/", "https://www.mamuncofoundr.com"));
    }

    const schoolPrefix = `/school/${hostOrg.slug}`;

    // If a signed-in user belongs to a different org, kick them to apex
    if (userId) {
      const orgId = sessionClaims?.metadata?.organization_id;
      if (orgId && orgId !== hostOrg.id) {
        return NextResponse.redirect(new URL("/", "https://www.mamuncofoundr.com"));
      }
    }

    // Already on the rewritten path — no action needed
    if (!pathname.startsWith(schoolPrefix)) {
      const rewritePath = pathname === "/" ? schoolPrefix : schoolPrefix + pathname;
      return NextResponse.rewrite(new URL(rewritePath, req.url));
    }
  }

  // ----------------------------------------------------------------
  // AUTH GATES
  // ----------------------------------------------------------------

  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (userId) {
    const orgId = sessionClaims?.metadata?.organization_id;

    // ----------------------------------------------------------------
    // SCHOOL USERS
    // ----------------------------------------------------------------
    if (orgId) {
      if (isApiRoute || isPublicRoute(req)) {
        return NextResponse.next();
      }

      if (isSchoolOnboardingRoute(req)) {
        return NextResponse.next();
      }

      const org = await resolveOrgRecord(orgId);

      if (!org) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // If on apex with a subdomain configured, redirect to the subdomain
      if (!subdomain && org.subdomain) {
        const proto = req.nextUrl.protocol;
        return NextResponse.redirect(
          new URL(`/dashboard`, `${proto}//${org.subdomain}.mamuncofoundr.com`),
        );
      }

      // FERPA gate
      if (!org.ferpa_dpa_signed_at) {
        const pendingUrl = new URL(`/school/${org.slug}/pending-activation`, req.url);
        if (pathname !== pendingUrl.pathname) {
          return NextResponse.redirect(pendingUrl);
        }
        return NextResponse.next();
      }

      // Onboarding gate
      if (!sessionClaims?.metadata?.onboardingComplete) {
        const schoolOnboardingUrl = new URL(`/school/${org.slug}/onboarding`, req.url);
        if (pathname !== schoolOnboardingUrl.pathname) {
          return NextResponse.redirect(schoolOnboardingUrl);
        }
        return NextResponse.next();
      }

      // School user trying to access a general route → school dashboard
      if (!isSchoolRoute(req)) {
        return NextResponse.redirect(new URL(`/school/${org.slug}/dashboard`, req.url));
      }

      if (!isApiRoute && !isStaticAsset) {
        updateUserActivity(userId).catch(console.error);
      }
      return NextResponse.next();
    }

    // ----------------------------------------------------------------
    // GENERAL USERS
    // ----------------------------------------------------------------

    if (isOnboardingRoute(req)) {
      return NextResponse.next();
    }

    if (isSchoolRoute(req) && !isApiRoute) {
      return NextResponse.redirect(new URL("/cofoundr-matching", req.url));
    }

    if (!sessionClaims?.metadata?.onboardingComplete) {
      if (isPublicRoute(req) || isApiRoute) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    if (!isPublicRoute(req) && !isApiRoute && !isStaticAsset) {
      updateUserActivity(userId).catch(console.error);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
