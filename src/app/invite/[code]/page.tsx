"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const searchParams = useSearchParams();
  const { code } = React.use(params); // mamun-xxxx

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
  }, [code, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-xl font-semibold">Referral saved</h1>
    </div>
  );
}
