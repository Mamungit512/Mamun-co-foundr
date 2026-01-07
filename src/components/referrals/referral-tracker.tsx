"use client";

import Script from "next/script";
import { useEffect } from "react";
import { captureReferralCode } from "@/lib/referral-utils";

export default function ReferralTracker() {
  useEffect(() => {
    captureReferralCode();
  }, []);

  // FirstPromoter tracking scripts:
  // 1. Inline script initializes fpr and triggers click tracking
  // 2. CDN script provides the full tracking library
  // These set _fprom_tid and _fprom_ref cookies when user visits via referral link
  return (
    <>
      <Script
        id="firstpromoter"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w){w.fpr=w.fpr||function(){w.fpr.q = w.fpr.q||[];w.fpr.q[arguments[0]=='set'?'unshift':'push'](arguments);};})(window);
            fpr("init", {cid:"${process.env.NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID}"});
            fpr("click");
          `,
        }}
      />
      <Script
        id="firstpromoter-lib"
        src="https://cdn.firstpromoter.com/fpr.js"
        strategy="afterInteractive"
      />
    </>
  );
}
