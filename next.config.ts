import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We are preserving the existing image settings:
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kupormmfrnbgayyiwnfo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // NEW ADDITION 1: CORS SETTINGS (Prevents data blocking)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://www.mamuncofoundr.com", // Your own site address
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  // NEW ADDITION 2: REWRITE SETTINGS (To bypass AdBlockers)
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
};

export default nextConfig;