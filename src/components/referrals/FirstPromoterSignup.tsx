"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { trackFirstPromoterReferral } from "@/lib/referral-utils";

const FP_TRACKED_KEY = "fp_referral_tracked";

/**
 * Component that tracks FirstPromoter referral after user signup.
 * Should be placed on post-signup pages (onboarding, dashboard).
 *
 * It will:
 * 1. Check if user is signed in and has an email
 * 2. Check if we've already tracked this referral (via localStorage)
 * 3. Call fpr("referral", {email, uid}) to link user to promoter
 * 4. Mark as tracked to prevent duplicate calls
 */
export default function FirstPromoterSignup() {
  const { user, isLoaded } = useUser();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Wait for user to load
    if (!isLoaded || !user) return;

    // Prevent duplicate tracking in same session
    if (hasTrackedRef.current) return;

    // Check if already tracked for this user
    const trackedUserId = localStorage.getItem(FP_TRACKED_KEY);
    if (trackedUserId === user.id) {
      console.log("FirstPromoter referral already tracked for this user");
      return;
    }

    // Get user's primary email
    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      console.warn(
        "No email found for user, cannot track FirstPromoter referral",
      );
      return;
    }

    // Track the referral
    hasTrackedRef.current = true;
    const success = trackFirstPromoterReferral(email, user.id);

    if (success) {
      // Mark as tracked to prevent future calls
      localStorage.setItem(FP_TRACKED_KEY, user.id);
    }
  }, [isLoaded, user]);

  // This component doesn't render anything
  return null;
}
