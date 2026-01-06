"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import {
  getSavedReferralCode,
  getFirstPromoterRef,
} from "@/lib/referral-utils";
import { trackEvent } from "@/lib/posthog-events";

export default function SignUpPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [fpRef, setFpRef] = useState<string | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const code = getSavedReferralCode();
    const fpRefValue = getFirstPromoterRef();

    setReferralCode(code);
    setFpRef(fpRefValue);

    if (code || fpRefValue) {
      console.log("📝 Sign up with referral:", { code, fpRef: fpRefValue });
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
          }}
          forceRedirectUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
