"use client";

import Script from "next/script";
import { useEffect } from "react";
import { captureReferralCode } from "@/lib/referral-utils";

export default function ReferralTracker() {
  useEffect(() => {
    captureReferralCode();
  }, []);

  return (
    <>
      <Script
        id="firstpromoter"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w){w.fpr=w.fpr||function(){w.fpr.q = w.fpr.q||[];w.fpr.q[arguments[0]=='set'?'unshift':'push'](arguments);};})(window);
            fpr("init", {cid:"YOUR_FIRSTPROMOTER_ID"});
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
