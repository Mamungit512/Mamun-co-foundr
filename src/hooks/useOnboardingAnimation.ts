"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Motion Profile
 * ─────────────────────────────────────────────────────────────
 * stepEntry     → power2.out  | 400ms total, stagger 75ms
 *                 Fields rise 28px → 0, fade in. Snappy + readable.
 * progressUpdate→ back.out(1.4) | 600ms
 *                 Bar overshoots slightly, then settles. "Physical" feel.
 * slideIn       → power2.out  | 320ms
 * slideOut      → power2.in   | 200ms
 * errorShake    → elastic.out(1, 0.5) on final settle | ~420ms total
 *                 ±7px → ±7px → ±5px → 0. Haptic-style feedback.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * useStepEntry
 * Attach the returned ref to a field-container div.
 * On mount, all direct children stagger up from y:28 with a power2.out ease.
 */
export function useStepEntry() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = Array.from(el.children);
    if (children.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        children,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.075,
          ease: "power2.out",
          clearProps: "all",
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return ref;
}

/**
 * useErrorShake
 * Returns { formRef, triggerShake }.
 * Call triggerShake() when react-hook-form validation fails.
 * The sequence: x:7 → -7 → 5 → -5 → 0 (elastic settle).
 */
export function useErrorShake() {
  const formRef = useRef<HTMLFormElement>(null);

  const triggerShake = useCallback(() => {
    const el = formRef.current;
    if (!el) return;

    gsap
      .timeline()
      .to(el, { x: 7, duration: 0.08, ease: "power2.out" })
      .to(el, { x: -7, duration: 0.08, ease: "power2.out" })
      .to(el, { x: 5, duration: 0.07, ease: "power2.out" })
      .to(el, { x: -5, duration: 0.07, ease: "power2.out" })
      .to(el, {
        x: 0,
        duration: 0.18,
        ease: "elastic.out(1, 0.5)",
        clearProps: "x",
      });
  }, []);

  return { formRef, triggerShake };
}

/**
 * useProgressBar
 * Attach barRef to the fill element.
 * Call update(percent) to liquid-animate the bar to a new width.
 * back.out(1.4) gives the elastic overshoot on arrival.
 */
export function useProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  const update = useCallback((percent: number) => {
    if (!barRef.current) return;
    gsap.to(barRef.current, {
      width: `${percent}%`,
      duration: 0.6,
      ease: "back.out(1.4)",
    });
  }, []);

  return { barRef, update };
}

/**
 * useStepTransition
 * Manages slide+fade between steps in a container ref.
 * direction "forward" → outgoing exits left, incoming enters right.
 * direction "back"    → outgoing exits right, incoming enters left.
 */
export function useStepTransition() {
  const containerRef = useRef<HTMLDivElement>(null);

  const transition = useCallback(
    (direction: "forward" | "back", onMidpoint: () => void) => {
      const el = containerRef.current;
      const xOut = direction === "forward" ? -70 : 70;
      const xIn = direction === "forward" ? 70 : -70;

      if (!el) {
        onMidpoint();
        return;
      }

      gsap.to(el, {
        opacity: 0,
        x: xOut,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          onMidpoint();
          // A single rAF ensures React has flushed the new step before we slide in
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              gsap.fromTo(
                el,
                { opacity: 0, x: xIn },
                {
                  opacity: 1,
                  x: 0,
                  duration: 0.32,
                  ease: "power2.out",
                  clearProps: "all",
                },
              );
            });
          });
        },
      });
    },
    [],
  );

  return { containerRef, transition };
}
