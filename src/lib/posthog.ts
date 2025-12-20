import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!apiKey) {
      console.warn("PostHog API key not found. Analytics disabled.");
      return;
    }

    posthog.init(apiKey, {
      api_host: host || "https://us.i.posthog.com",
      person_profiles: "identified_only", // Only create profiles for identified users
      capture_pageview: false, // We'll manually capture pageviews
      capture_pageleave: true, // Automatically capture when user leaves
      loaded: () => {
        if (process.env.NODE_ENV === "development") {
          console.log("✅ PostHog initialized");
        }
      },
    });
  }
}

export { posthog };
