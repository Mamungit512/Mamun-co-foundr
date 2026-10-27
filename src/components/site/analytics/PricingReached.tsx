"use client";

import { useEffect, useRef } from "react";

import { trackEvent } from "./events";

// Fires pricing_reached once when the visitor scrolls past the tier grid.
export default function PricingReached() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        trackEvent("pricing_reached", {});
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} aria-hidden="true" />;
}
