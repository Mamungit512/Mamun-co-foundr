"use client";

import { useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SessionRefreshRedirect({ to }: { to: string }) {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    session.reload().then(() => router.push(to));
  }, [session, router, to]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm" style={{ color: "#9cadb7" }}>
        Setting up your account…
      </p>
    </div>
  );
}
