"use client";

import Script from "next/script";
import { useEffect } from "react";
import { captureReferralCode } from "@/lib/referral-utils";

export default function ReferralTracker() {
  const firstPromoterId = process.env.NEXT_PUBLIC_FIRSTPROMOTER_ID;

  useEffect(() => {
    captureReferralCode();
  }, []);

  // Only load FirstPromoter script if ID is configured
  if (!firstPromoterId) {
    console.warn(
      "FirstPromoter ID not configured. Set NEXT_PUBLIC_FIRSTPROMOTER_ID in your environment variables.",
    );
    return null;
  }

  return (
    <>
      <Script
        id="firstpromoter"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w){w.fpr=w.fpr||function(){w.fpr.q = w.fpr.q||[];w.fpr.q[arguments[0]=='set'?'unshift':'push'](arguments);};})(window);
            fpr("init", {cid:"${firstPromoterId}"});
            fpr("click");
          `,
        }}
      />
      <Script
        src="https://cdn.firstpromoter.com/fpr.js"
        strategy="afterInteractive"
      />
    </>
  );
}
