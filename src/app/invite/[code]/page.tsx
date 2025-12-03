"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import React from "react";

export default function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const searchParams = useSearchParams();
  const { code } = React.use(params); // mamun-xxxx
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const fpRef = searchParams.get("fp_ref"); // FP code
    const referralCode = code || fpRef;

    if (code) {
      localStorage.setItem("mamun_referral_code", code);
    }

    if (fpRef) {
      localStorage.setItem("fp_ref", fpRef);
    }

    if (referralCode) {
      document.cookie = `mamun_ref=${referralCode}; path=/; max-age=${30 * 24 * 60 * 60}`;
    }

    // Wait for auth to load before redirecting
    if (!isLoaded) return;

    // Start countdown and redirect after welcoming
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect based on auth status
          router.push(isSignedIn ? "/cofoundr-matching" : "/sign-up");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [code, searchParams, router, isSignedIn, isLoaded]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mb-4 text-6xl">🎉</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          Welcome to Mamun!
        </h1>
        <p className="mb-4 text-gray-600">Your referral code has been saved</p>
        <div className="inline-flex items-center justify-center gap-2 rounded-full bg-green-100 px-4 py-2 font-medium text-green-700">
          <span className="text-xl">✓</span>
          <span>Redirecting in {countdown}s...</span>
        </div>
      </div>
    </div>
  );
}
