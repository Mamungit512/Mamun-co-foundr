"use client";

import { Analytics } from "@vercel/analytics/next";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { CALENDLY_URL } from "@/content/site/shell";
import { trackEvent } from "./events";

// Site-wide analytics: page views, plus every Calendly and mailto click
// caught by one delegated listener, so no button needs its own handler.
// Position comes from the link's data-cta (header / hero / band…) or, for
// text links that aren't styled as buttons, data-position (footer).
export default function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/matching") trackEvent("matching_page_view", {});
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      const page = window.location.pathname;
      if (href.startsWith(CALENDLY_URL)) {
        const position = link.getAttribute("data-cta") || link.getAttribute("data-position") || "inline";
        trackEvent("demo_cta_click", { page, position });
        trackEvent("calendly_outbound", { page, position, label: link.textContent?.trim() ?? "" });
      } else if (href.startsWith("mailto:")) {
        trackEvent("outbound_email", { page });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return <Analytics />;
}
