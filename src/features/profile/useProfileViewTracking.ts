"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

// Module-level set guards against duplicate POSTs within a browser session.
const recordedPairs = new Set<string>();

const DWELL_MS = 10_000;

/**
 * Records an engaged profile view (dwell >10s AND scroll to card bottom) via
 * POST /api/profile-views. Only fires once per (viewer, target) pair per session.
 *
 * @param targetUserId  The profile being viewed.
 * @param cardRef       Ref attached to the card's outermost DOM element.
 */
export function useProfileViewTracking(
  targetUserId: string | undefined,
  cardRef: React.RefObject<HTMLElement | null>,
) {
  const { userId } = useAuth();

  const dwelledRef = useRef(false);
  const scrolledBottomRef = useRef(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!targetUserId || !userId) return;

    dwelledRef.current = false;
    scrolledBottomRef.current = false;
    firedRef.current = false;

    const maybeRecord = () => {
      if (firedRef.current) return;
      if (!dwelledRef.current || !scrolledBottomRef.current) return;

      const pairKey = `${userId}:${targetUserId}`;
      if (recordedPairs.has(pairKey)) return;

      firedRef.current = true;
      recordedPairs.add(pairKey);

      fetch("/api/profile-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_user_id: targetUserId }),
      }).catch((err) => console.error("[profileViewTracking] failed:", err));
    };

    // Condition 1: dwell >10s
    const timer = setTimeout(() => {
      dwelledRef.current = true;
      maybeRecord();
    }, DWELL_MS);

    // Condition 2: bottom sentinel enters viewport = user scrolled to card bottom
    const card = cardRef.current;
    let sentinel: HTMLElement | null = null;
    let observer: IntersectionObserver | null = null;

    if (card) {
      sentinel = document.createElement("div");
      sentinel.style.height = "1px";
      card.appendChild(sentinel);

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            scrolledBottomRef.current = true;
            maybeRecord();
          }
        },
        { threshold: 1.0 },
      );
      observer.observe(sentinel);
    }

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
      sentinel?.remove();
    };
  }, [targetUserId, userId, cardRef]);
}
