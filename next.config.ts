import type { NextConfig } from "next";

// Content-Security-Policy is shipped in report-only mode for now. This app
// pulls in Clerk, Supabase, PostHog, Vercel Analytics, FirstPromoter, and a
// CDN-hosted face-api model — enumerating every host precisely (Clerk's
// frontend-api domain in particular varies by environment) needs a
// report-only run against real traffic before it's safe to enforce. See
// docs/DEPLOYMENT_FINDINGS.md.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdn.firstpromoter.com https://v2.firstpromoter.com https://*.clerk.accounts.dev https://*.clerk.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://img.clerk.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.clerk.accounts.dev https://*.clerk.com https://us.i.posthog.com https://cdn.firstpromoter.com https://v2.firstpromoter.com https://cdn.jsdelivr.net",
  "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://calendly.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy-Report-Only", value: cspDirectives },
];

// The marketing site (src/app/(site)) is served on the apex hosts only;
// school subdomains rewrite "/" and other paths to their own pages.
const APEX_HOST = [
  { type: "host" as const, value: "(?:(?:www\\.)?mamuncofoundr\\.com|localhost|.+\\.vercel\\.app)" },
];

const isDev = process.env.NODE_ENV === "development";

// Enforced CSP for the five marketing routes (spec §17): self, plus
// calendly.com and the Vercel Analytics domain. Next's inline bootstrap
// scripts need 'unsafe-inline'; dev also needs eval and the HMR socket.
const siteCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' https://va.vercel-scripts.com${isDev ? " ws:" : ""}`,
  "frame-src https://calendly.com",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const SITE_ROUTES = ["/", "/matching", "/platform", "/pricing", "/partner"];

// Legacy B2C marketing URLs → nearest new route (spec §1, §13, §17; route
// map decisions of 15 Oct 2026). App routes and the legal pages the app
// still links to are not redirected.
const LEGACY_REDIRECTS = [
  { source: "/careers", destination: "/" }, // Careers dropped
  { source: "/contact-us", destination: "/partner" }, // Contact Support → /partner
  { source: "/mission", destination: "/" }, // old mission page
];

// Logged-in app routes and student data are never indexed (FERPA, MCFM SEO
// ticket). A response header covers every response — pages, redirects and
// data — on the main domain and on school subdomains alike. School pages also
// carry a robots meta tag; only public landing and marketing pages index.
const NOINDEX_ROUTES = [
  "/admin/:path*",
  "/billing/:path*",
  "/cofoundr-matching/:path*",
  "/dashboard/:path*",
  "/edit-profile/:path*",
  "/invite/:path*",
  "/messages/:path*",
  "/onboarding/:path*",
  "/profile/:path*",
  "/matches/:path*",
  "/cofounder/:path*",
  "/school/:slug/:path+",
];

const nextConfig: NextConfig = {
  // Serve page metadata in <head> for every user agent, not just Next's
  // short bot list (Next 15.2+ otherwise streams it into <body>). Share
  // previewers and "view source" checks read <head> only (MCFM SEO ticket).
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kupormmfrnbgayyiwnfo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "qfdzpmryhlahskfubvxt.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      ...SITE_ROUTES.map((source) => ({
        source,
        has: APEX_HOST,
        headers: [{ key: "Content-Security-Policy", value: siteCsp }],
      })),
      ...NOINDEX_ROUTES.map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      })),
    ];
  },
  async redirects() {
    return LEGACY_REDIRECTS.map((r) => ({ ...r, has: APEX_HOST, statusCode: 301 as const }));
  },
};

export default nextConfig;
