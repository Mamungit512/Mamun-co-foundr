"use client";

import { Children, cloneElement, isValidElement, useCallback, useEffect, useRef } from "react";

// Wraps a product mock so its demo plays once when it scrolls into view and
// then rests on its final frame (spec §8). Replay restarts it. The hidden
// start states in site.css apply only after this sets html[data-motion], so
// without JS — or with reduced motion — the mock is simply static.

type Props = {
  /** Demo name, e.g. "profile" or "timeline". */
  name: string;
  /** Stagger mode for direct children when the frame itself rises. */
  dm?: "rise";
  step?: "fast" | "mid" | "slow";
  /** Visible to assistive tech in place of the mock. */
  description: string;
  /** Real, interactive content inside the frame (not hidden from AT). */
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export default function DemoFrame({
  name,
  dm,
  step,
  description,
  footer,
  className = "",
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    document.documentElement.setAttribute("data-motion", "1");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute("data-play", "1");
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const replay = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.removeAttribute("data-play");
    void el.offsetWidth; // restart the CSS animations
    el.setAttribute("data-play", "1");
  }, []);

  return (
    <div ref={ref} data-demo={name} data-dm={dm} data-step={step} className={className}>
      <button
        type="button"
        data-replay=""
        onClick={replay}
        aria-label="Replay this animation"
        className="absolute top-10 right-10 z-6 hidden min-h-28 cursor-pointer items-center gap-6 rounded-pill border border-dark-line bg-ink px-11 py-7 font-sans text-white opacity-0 transition-opacity type-replay"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true" className="block">
          <path
            d="M10 6a4 4 0 1 1-1.2-2.85M10 1.5v2.5H7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Replay</span>
      </button>
      {/* Replay first, then the mock, as in the prototype, so its nth-child
          stagger timings hold. The mock is decorative; the description
          after it stands in for it. */}
      {Children.map(children, (child) =>
        isValidElement<{ "aria-hidden"?: boolean }>(child)
          ? cloneElement(child, { "aria-hidden": true })
          : child,
      )}
      <p className="sr-only">{description}</p>
      {footer}
    </div>
  );
}
