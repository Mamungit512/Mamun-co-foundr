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

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
