"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

type Props = {
  slug: string;
  mode: "signIn" | "signUp";
  label?: string;
};

export default function GoogleOAuthButton({ slug, mode, label }: Props) {
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isLoaded = mounted && (mode === "signIn" ? signInLoaded : signUpLoaded);
  const display =
    label ??
    (mode === "signIn" ? "Sign in with Google" : "Sign up with Google");

  async function handleClick() {
    if (!isLoaded) return;
    setError(null);
    setSubmitting(true);
    try {
      const opts = {
        strategy: "oauth_google" as const,
        redirectUrl: `/school/${slug}/sso-callback`,
        redirectUrlComplete: `/school/${slug}/sso-complete`,
      };
      if (mode === "signIn" && signIn) {
        await signIn.authenticateWithRedirect(opts);
      } else if (mode === "signUp" && signUp) {
        await signUp.authenticateWithRedirect(opts);
      }
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "errors" in err &&
        Array.isArray((err as { errors: { message: string }[] }).errors)
          ? (err as { errors: { message: string }[] }).errors[0]?.message
          : "Could not start Google sign-in. Please try again.";
      setError(msg ?? "Could not start Google sign-in. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={submitting || !isLoaded}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e8e4dc] bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-[#faf8f4] disabled:opacity-50"
        style={{ color: "#333f48" }}
      >
        <FcGoogle className="h-4 w-4" />
        {submitting ? "Redirecting…" : display}
      </button>
      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
