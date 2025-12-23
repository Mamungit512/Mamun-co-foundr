import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    // We removed the 'host' variable because we are hardcoding the proxy URL below.

    if (!apiKey) {
      console.warn("PostHog API key not found. Analytics disabled.");
      return;
    }

    posthog.init(apiKey, {
      // UPDATE 1: Route data through your own domain to bypass AdBlockers (Reverse Proxy)
      // This matches the rewrite rules added to next.config.ts
      api_host: "https://www.mamuncofoundr.com/ingest",

      // UPDATE 2: Create profiles for all users (including anonymous)
      // This prevents data loss if the 'identify' call fails due to network errors
      person_profiles: "always",

      capture_pageview: false, // We'll manually capture pageviews
      capture_pageleave: true, // Automatically capture when user leaves
      loaded: () => {
        if (process.env.NODE_ENV === "development") {
          console.log("✅ PostHog initialized via Proxy");
        }
      },
    });
  }
}

export { posthog };