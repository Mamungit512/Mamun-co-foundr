"use client";

import { useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SessionRefreshRedirect({ to }: { to: string }) {
  const { session } = useSession();
  const router = useRouter();
  const triggered = useRef(false);

  useEffect(() => {
    if (!session || triggered.current) return;
    triggered.current = true;
    session.getToken({ skipCache: true }).then(() => router.push(to));
  }, [session, router, to]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm" style={{ color: "#9cadb7" }}>
        Setting up your account…
      </p>
    </div>
  );
}
