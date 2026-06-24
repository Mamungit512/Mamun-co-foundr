import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getRequiredPrivacyPolicyVersion,
  getRequiredTermsVersion,
  isConsentSatisfied,
} from "@/features/legal/consent";
import { isEmailDomainAllowed } from "@/features/school/auth/email-domain";
import { getOrgConfig } from "@/features/school/registry/registry";

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isSchoolOnboardingRoute = createRouteMatcher([
  "/school/:slug/onboarding(.*)",
]);
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
  "/school/:slug/terms-and-conditions",
  "/school/:slug/not-authorized",
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
  allowed_email_domains: string[];
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
      .select("id, slug, subdomain, ferpa_dpa_signed_at, allowed_email_domains")
      .eq("subdomain", subdomain)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

async function resolveOrgBySlug(slug: string): Promise<OrgRecord | null> {
  try {
    const supabase = supabaseAdmin();
    if (!supabase) return null;
    const { data } = await supabase
      .from("organizations")
      .select("id, slug, subdomain, ferpa_dpa_signed_at, allowed_email_domains")
      .eq("slug", slug)
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

async function getVerifiedPrimaryEmail(userId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primary = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    );
    if (!primary || primary.verification?.status !== "verified") return null;
    return primary.emailAddress.toLowerCase();
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
  // x-forwarded-host is set by Vercel and reflects the original hostname even
  // behind load balancers or proxies that rewrite the Host header.
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const isApiRoute = pathname.startsWith("/api/");
  const isStaticAsset = /\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2?|ttf)$/.test(pathname);

  const subdomain = getSubdomain(host);

  // Google and browsers probe /favicon.ico on each subdomain hostname.
  if (pathname === "/favicon.ico" && subdomain) {
    const hostOrg = await resolveOrgBySubdomain(subdomain);
    const slug = hostOrg?.slug ?? (getOrgConfig(subdomain) ? subdomain : null);
    const faviconUrl = slug ? getOrgConfig(slug)?.branding.faviconUrl : undefined;
    if (faviconUrl) {
      return NextResponse.rewrite(new URL(faviconUrl, req.url));
    }
  }

  // ----------------------------------------------------------------
  // SUBDOMAIN REWRITE
  // Runs before auth so the rest of the middleware sees /school/{slug}/*
  // ----------------------------------------------------------------
  if (subdomain && !isApiRoute && !isStaticAsset) {
    const hostOrg = await resolveOrgBySubdomain(subdomain);

    if (!hostOrg) {
      // Unknown subdomain — send to apex
      return NextResponse.redirect(new URL("/", "https://www.mamuncofoundr.com"));
    }

    const schoolPrefix = `/school/${hostOrg.slug}`;

    // Already on the rewritten path — no action needed
    if (!pathname.startsWith(schoolPrefix)) {
      const rewritePath = pathname === "/" ? schoolPrefix : schoolPrefix + pathname;
      return NextResponse.rewrite(new URL(rewritePath, req.url));
    }
  }

  // ----------------------------------------------------------------
  // DERIVE CONTEXT FROM PATH
  // After the subdomain rewrite the pathname is the source of truth:
  //   /school/<slug>/...  → school context for that slug
  //   anything else       → general context
  // ----------------------------------------------------------------
  const pathSlug = pathname.match(/^\/school\/([^/]+)/)?.[1] ?? null;
  const isSchoolContext = !!pathSlug;

  // ----------------------------------------------------------------
  // UNAUTHENTICATED
  // ----------------------------------------------------------------
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (!userId) {
    return NextResponse.next();
  }

  // ----------------------------------------------------------------
  // SCHOOL CONTEXT
  // Runs for everyone on a /school/<slug> path (or after subdomain rewrite),
  // regardless of the user's global organization_id.
  // ----------------------------------------------------------------
  if (isSchoolContext) {
    if (isApiRoute || isPublicRoute(req)) {
      return NextResponse.next();
    }

    const org = await resolveOrgBySlug(pathSlug!);
    if (!org) {
      // Unknown slug — let the [slug] layout handle notFound()
      return NextResponse.next();
    }

    // MEMBERSHIP / EMAIL-DOMAIN GATE
    // Skip on auth-flow paths (sign-in/up/sso-*): sso-complete assigns org.
    const isAuthFlowPath = /\/(sign-in|sign-up|sso-callback|sso-complete)(\/|$)/.test(pathname);
    if (!isAuthFlowPath) {
      const claimOrgId = sessionClaims?.metadata?.organization_id;
      // Fast path: already assigned to this org via Clerk metadata → skip Clerk API call.
      if (claimOrgId !== org.id) {
        const email = await getVerifiedPrimaryEmail(userId);
        if (!email || !isEmailDomainAllowed(email, org.allowed_email_domains)) {
          const notAuthorizedUrl = new URL(`/school/${pathSlug}/not-authorized`, req.url);
          if (pathname !== notAuthorizedUrl.pathname) {
            return NextResponse.redirect(notAuthorizedUrl);
          }
          return NextResponse.next();
        }
      }
    }

    // FERPA gate
    if (!org.ferpa_dpa_signed_at) {
      const pendingUrl = new URL(`/school/${org.slug}/pending-activation`, req.url);
      if (pathname !== pendingUrl.pathname) {
        return NextResponse.redirect(pendingUrl);
      }
      return NextResponse.next();
    }

    // CONSENT gate: privacy policy + terms
    const [acceptedPrivacyVersion, acceptedTermsVersion] = await Promise.all([
      resolveAcceptedConsentVersion(userId, "privacy_policy"),
      resolveAcceptedConsentVersion(userId, "terms_of_service"),
    ]);
    const requiredPrivacyVersion = getRequiredPrivacyPolicyVersion(org.slug);
    const requiredTermsVersion = getRequiredTermsVersion(org.slug);
    const consentSatisfied =
      isConsentSatisfied(acceptedPrivacyVersion, requiredPrivacyVersion) &&
      isConsentSatisfied(acceptedTermsVersion, requiredTermsVersion);
    if (!consentSatisfied) {
      const acceptUrl = new URL(`/school/${org.slug}/accept-policies`, req.url);
      if (pathname !== acceptUrl.pathname) {
        return NextResponse.redirect(acceptUrl);
      }
      return NextResponse.next();
    }

    // SCHOOL ONBOARDING gate — per-context flag keyed by org UUID.
    // Legacy fallback: treat global onboardingComplete as school-done when the
    // user's organization_id matches this org (users onboarded before the split).
    const schoolOnboarding = sessionClaims?.metadata?.schoolOnboarding;
    const schoolDone =
      schoolOnboarding?.[org.id] === true ||
      (sessionClaims?.metadata?.onboardingComplete === true &&
        sessionClaims?.metadata?.organization_id === org.id);

    if (isSchoolOnboardingRoute(req)) {
      if (schoolDone) {
        return NextResponse.redirect(
          new URL(`/school/${org.slug}/dashboard`, req.url),
        );
      }
      return NextResponse.next();
    }

    if (!schoolDone) {
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
  // GENERAL CONTEXT
  // Runs for everyone on the apex/main site, regardless of organization_id.
  // School users reaching the main site get the general experience.
  // ----------------------------------------------------------------

  if (isOnboardingRoute(req)) {
    return NextResponse.next();
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
});

export const config = {
  matcher: [
    "/favicon.ico",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
