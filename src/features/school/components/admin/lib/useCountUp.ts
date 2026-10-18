"use client";

import { useEffect, useRef, useState } from "react";
import { valueAt } from "./countUp";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Counts up to `target`. First appearance runs 0 to target, and a later change
// (e.g. after Refresh) tweens from what was on screen to the new number.
export function useCountUp(target: number, duration = 900): number {
  const reduced = prefersReducedMotion();
  const [value, setValue] = useState(0);
  const shown = useRef(0);

  useEffect(() => {
    if (reduced) return;
    const from = shown.current;
    if (from === target) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - start) / duration;
      const next = valueAt(from, target, t);
      shown.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduced]);

  return reduced ? target : value;
}
