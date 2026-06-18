"use client";

import { useEffect, useState } from "react";
import { useUser, useSession, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const PUBLIC_PATHS = new Set([
  "/",
  "/careers",
  "/contact-us",
  "/mission",
  "/privacy-policy",
  "/refund-policy",
  "/pricing",
  "/founder-archetypes",
]);

export default function SchoolUserGuard() {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const { sessionClaims } = useAuth();
  const pathname = usePathname();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user || !session) return;
    // Don't interfere with public pages — school users can browse pricing, etc.
    if (PUBLIC_PATHS.has(pathname)) return;

    const liveOrgId = user.publicMetadata?.organization_id as string | undefined;
    const claimsOrgId = (
      sessionClaims as { metadata?: { organization_id?: string } }
    )?.metadata?.organization_id;

    if (liveOrgId && !claimsOrgId) {
      // JWT is stale — organization_id was set after the current session was
      // minted. Force a token refresh so the middleware sees the updated claims.
      setIsRefreshing(true);
      session.touch().then(() => {
        window.location.reload();
      });
    }
  }, [isLoaded, user, session, sessionClaims, pathname]);

  if (isRefreshing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-2xl">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
          <p className="text-sm font-medium text-gray-800">Updating your account…</p>
          <p className="mt-1 text-xs text-gray-400">You&apos;ll be redirected shortly.</p>
        </div>
      </div>
    );
  }

  return null;
}
