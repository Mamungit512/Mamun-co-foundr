"use client";

export const REFERRAL_COOKIE_NAME = "mamun_ref";
export const REFERRAL_STORAGE_KEY = "mamun_referral_code";

export function captureReferralCode() {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const fpRef = urlParams.get("fp_ref") || urlParams.get("ref");

  if (fpRef) {
    localStorage.setItem(REFERRAL_STORAGE_KEY, fpRef);
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
