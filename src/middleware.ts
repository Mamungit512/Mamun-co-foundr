import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getRequiredPrivacyPolicyVersion,
  isConsentSatisfied,
} from "@/features/legal/consent";

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
  "/api/cron/(.*)",
  "/school/:slug",
  "/school/:slug/privacy-policy",
  "/school/:slug/sign-up(.*)",
  "/school/:slug/sign-in(.*)",
  "/school/:slug/sso-callback(.*)",
  "/school/:slug/sso-complete(.*)",
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

async function resolveAcceptedConsentVersion(
  userId: string,
  document: string,
): Promise<string | null> {
  try {
    const supabase = supabaseAdmin();
    if (!supabase) return null;
    const { data } = await supabase
      .from("user_consents")
      .select("version")
      .eq("user_id", userId)
      .eq("document", document)
      .order("accepted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.version ?? null;
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
  const pathname = req.nextUrl.pathname;

  // Crawler metadata routes must bypass subdomain rewrite and auth gates
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return NextResponse.next();
  }

  const { userId, sessionClaims, redirectToSignIn } = await auth();
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

    // If a signed-in user belongs to a different org, kick them to apex —
    // unless they're on an auth-flow path, where /sso-complete needs to
    // render "This isn't your portal" (or the page needs to assign org).
    if (userId) {
      const orgId = sessionClaims?.metadata?.organization_id;
      const isAuthFlowPath = /\/(sign-in|sign-up|sso-callback|sso-complete)(\/|$)/.test(pathname);
      if (orgId && orgId !== hostOrg.id && !isAuthFlowPath) {
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

      // Resolve org and latest consent version in parallel. Org is needed for all
      // subsequent gates; consent version is needed for the privacy-policy gate.
      // Fetching in parallel keeps middleware latency the same as before this gate
      // was added (one round-trip, not two).
      const [org, acceptedPrivacyVersion] = await Promise.all([
        resolveOrgRecord(orgId),
        resolveAcceptedConsentVersion(userId, "privacy_policy"),
      ]);

      if (!org) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Path-based tenant enforcement: a signed-in school user must not view
      // another org's /school/<slug> portal. Mirrors the subdomain guard above.
      // On subdomains the rewrite has already aligned the slug, so this is a
      // no-op there; it only bites on apex /school/<other-slug> access.
      const pathSlug = pathname.match(/^\/school\/([^/]+)/)?.[1];
      const isAuthFlowPath = /\/(sign-in|sign-up|sso-callback|sso-complete)(\/|$)/.test(pathname);
      if (pathSlug && pathSlug !== org.slug && !isAuthFlowPath) {
        return NextResponse.redirect(
          new URL(`/school/${org.slug}/dashboard`, req.url),
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

      // Privacy-policy consent gate (org active -> consent -> onboard). Runs
      // before onboarding handling so the onboarding route is gated too. The
      // required version is read from edge-safe config; no DB call here.
      const requiredPrivacyVersion = getRequiredPrivacyPolicyVersion(org.slug);
      if (!isConsentSatisfied(acceptedPrivacyVersion, requiredPrivacyVersion)) {
        const acceptUrl = new URL(`/school/${org.slug}/accept-policies`, req.url);
        if (pathname !== acceptUrl.pathname) {
          return NextResponse.redirect(acceptUrl);
        }
        return NextResponse.next();
      }

      // Keep already-onboarded users out of the onboarding flow.
      if (isSchoolOnboardingRoute(req)) {
        if (sessionClaims?.metadata?.onboardingComplete) {
          return NextResponse.redirect(
            new URL(`/school/${org.slug}/dashboard`, req.url),
          );
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

    if (isSchoolRoute(req) && !isApiRoute && !isPublicRoute(req)) {
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
