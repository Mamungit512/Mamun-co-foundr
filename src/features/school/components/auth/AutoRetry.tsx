"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AutoRetry() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.refresh(), 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm" style={{ color: "#9cadb7" }}>
        Setting up your account…
      </p>
    </div>
  );
}
