"use client";

export const REFERRAL_COOKIE_NAME = "mamun_ref";
export const REFERRAL_STORAGE_KEY = "mamun_referral_code";
export const FP_REF_STORAGE_KEY = "fp_ref";

export function captureReferralCode() {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  // Check all possible FirstPromoter URL params: fpr (default), fp_ref, ref
  const fpRef =
    urlParams.get("fpr") || urlParams.get("fp_ref") || urlParams.get("ref");

  if (fpRef) {
    localStorage.setItem(REFERRAL_STORAGE_KEY, fpRef);
    localStorage.setItem(FP_REF_STORAGE_KEY, fpRef);
    document.cookie = `${REFERRAL_COOKIE_NAME}=${fpRef}; path=/; max-age=${30 * 24 * 60 * 60}`;

    return fpRef;
  }

  return (
    localStorage.getItem(REFERRAL_STORAGE_KEY) ||
    getCookieValue(REFERRAL_COOKIE_NAME)
  );
}

function getCookieValue(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

export function clearReferralCode() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(REFERRAL_STORAGE_KEY);
  document.cookie = `${REFERRAL_COOKIE_NAME}=; path=/; max-age=0`;
}

export function getSavedReferralCode(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem(REFERRAL_STORAGE_KEY) ||
    getCookieValue(REFERRAL_COOKIE_NAME)
  );
}

/**
 * Get FirstPromoter's native referral ID from their cookie
 * This is set automatically by fpr("click") when user arrives via referral link
 */
export function getFirstPromoterRef(): string | null {
  if (typeof window === "undefined") return null;

  // FirstPromoter's native cookie, or our stored version
  return (
    getCookieValue("_fprom_ref") ||
    localStorage.getItem(FP_REF_STORAGE_KEY) ||
    null
  );
}

/**
 * Get FirstPromoter's tracking ID from their cookie (_fprom_tid)
 * This is the PREFERRED parameter for server-side tracking as it includes
 * deduplication logic to prevent multiple tracking for the same visitor
 */
export function getFirstPromoterTid(): string | null {
  if (typeof window === "undefined") return null;
  return getCookieValue("_fprom_tid");
}

/**
 * Track a referral signup with FirstPromoter
 * This should be called after a user signs up to link their email to the promoter
 */
export function trackFirstPromoterReferral(
  email: string,
  uid?: string,
): boolean {
  if (typeof window === "undefined") return false;

  if (window.fpr) {
    const data: { email: string; uid?: string } = { email };
    if (uid) {
      data.uid = uid;
    }
    window.fpr("referral", data);
    console.log("✅ FirstPromoter referral tracked:", { email, uid });
    return true;
  }

  console.warn("⚠️ FirstPromoter fpr() not available");
  return false;
}
