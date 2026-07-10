"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useParams } from "next/navigation";

export default function SSOCallbackPage() {
  const { slug } = useParams<{ slug: string }>();
  const complete = `/school/${slug}/sso-complete`;
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-sm" style={{ color: "#5f7280" }}>
        Completing sign-in…
      </div>
      <AuthenticateWithRedirectCallback
        signUpForceRedirectUrl={complete}
        signInForceRedirectUrl={complete}
      />
    </div>
  );
}
