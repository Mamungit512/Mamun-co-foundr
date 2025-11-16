"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getSavedReferralCode } from "@/lib/referral-utils";

export default function SignUpPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const code = getSavedReferralCode();
    setReferralCode(code);
    if (code) {
      console.log("📝 Sign up with referral:", code);
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
          }}
          forceRedirectUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}