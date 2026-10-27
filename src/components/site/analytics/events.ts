"use client";

import { track } from "@vercel/analytics";

// The spec §12 event list. Vercel Web Analytics is cookieless and
// first-party — no Google Analytics on a site sold on FERPA compliance.
type Events = {
  demo_cta_click: { page: string; position: string };
  calendly_outbound: { page: string; position: string; label: string };
  demo_form_start: Record<string, never>;
  demo_form_submit: { office: string; enrollment_band: string };
  matching_page_view: Record<string, never>;
  platform_tab_view: { tab: string };
  pricing_reached: Record<string, never>;
  outbound_email: { page: string };
};

export function trackEvent<E extends keyof Events>(name: E, props: Events[E]) {
  track(name, props);
}
