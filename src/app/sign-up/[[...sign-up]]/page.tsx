"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import {
  getSavedReferralCode,
  getFirstPromoterRef,
  getFirstPromoterTid,
} from "@/lib/referral-utils";
import { trackEvent } from "@/lib/posthog-events";

export default function SignUpPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [fpRef, setFpRef] = useState<string | null>(null);
  const [fpTid, setFpTid] = useState<string | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;
    let timeoutId: NodeJS.Timeout;

    const checkCookies = () => {
      const fpTidValue = getFirstPromoterTid();
      const fpRefValue = getFirstPromoterRef();
      const code = getSavedReferralCode();

      // If we found FirstPromoter cookies or exhausted attempts, set state
      if (fpTidValue || fpRefValue || attempts >= maxAttempts) {
        setFpTid(fpTidValue);
        setFpRef(fpRefValue);
        setReferralCode(code);

        if (code || fpRefValue || fpTidValue) {
          console.log("📝 Sign up with referral:", {
            code,
            fpRef: fpRefValue,
            fpTid: fpTidValue,
            attempts,
          });
        }

        // Track signup page view (only once)
        if (!hasTrackedRef.current) {
          hasTrackedRef.current = true;
          trackEvent.signupPageViewed({
            has_referral_code: !!code,
            referral_code: code || null,
            referrer_url:
              typeof document !== "undefined" ? document.referrer : undefined,
          });
        }
      } else {
        // Keep polling until FirstPromoter sets cookies
        attempts++;
        timeoutId = setTimeout(checkCookies, 200);
      }
    };

    checkCookies();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {referralCode && (
          <div className="mb-4 rounded-xl border-2 border-green-200 bg-green-50 p-4 text-center">
            <p className="text-sm font-medium text-green-700">
              You were invited by:{" "}
              <span className="font-bold">{referralCode}</span>
            </p>
          </div>
        )}
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl",
            },
          }}
          unsafeMetadata={{
            referral_code: referralCode,
            fp_ref: fpRef,
            fp_tid: fpTid,
          }}
          forceRedirectUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
