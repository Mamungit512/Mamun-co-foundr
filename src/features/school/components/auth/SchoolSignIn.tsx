"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  isEmailDomainAllowed,
  formatAllowedDomainsForCopy,
} from "@/features/school/auth/email-domain";
import {
  assignSchoolOrg,
  checkExistingUser,
  type ExistingUserInfo,
} from "@/features/school/auth/school-auth";
import GoogleOAuthButton from "./GoogleOAuthButton";

type Props = {
  slug: string;
  schoolName: string;
  allowedDomains: string[];
  initialError?: string | null;
  afterAuthRedirect?: string | null;
};

export default function SchoolSignIn({
  slug,
  schoolName,
  allowedDomains,
  initialError = null,
  afterAuthRedirect = null,
}: Props) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { getToken } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingSecondFactor, setPendingSecondFactor] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [submitting, setSubmitting] = useState(false);
  const [existingUser, setExistingUser] = useState<ExistingUserInfo>({
    exists: false,
    hasPassword: false,
    oauthProviders: [],
  });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const allowedCopy = formatAllowedDomainsForCopy(allowedDomains);
  const existingHasGoogle = existingUser.oauthProviders.includes("oauth_google");
  const showPasswordField =
    !existingUser.exists || existingUser.hasPassword;
  const showGoogleHint =
    existingUser.exists &&
    existingHasGoogle &&
    !existingUser.hasPassword;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setExistingUser({ exists: false, hasPassword: false, oauthProviders: [] });
    const trimmed = email.trim();
    if (!trimmed || !isEmailDomainAllowed(trimmed, allowedDomains)) return;
    debounceRef.current = setTimeout(async () => {
      const info = await checkExistingUser(trimmed);
      setExistingUser(info);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [email, allowedDomains]);

  async function completeSignIn(sessionId: string | null) {
    // setActive is guaranteed defined here: every caller only reaches this
    // after `isLoaded` was already checked truthy in the calling handler.
    await setActive!({ session: sessionId });
    const assigned = await assignSchoolOrg(slug);
    if ("error" in assigned) {
      setError(assigned.error);
      return;
    }
    await getToken({ skipCache: true });
    router.push(afterAuthRedirect ?? `/school/${slug}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);

    if (!isEmailDomainAllowed(email, allowedDomains)) {
      setError(
        `This portal is for ${schoolName}. Sign in at mamuncofoundr.com instead, or use a ${allowedCopy} email.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
        strategy: "password",
      });

      if (result.status === "complete") {
        await completeSignIn(result.createdSessionId);
        return;
      }

      // Clerk's "Client Trust" (and account-level MFA) can require a second
      // factor even with a correct password, e.g. when signing in from a
      // browser/device Clerk doesn't recognize (such as after clearing
      // cookies). The installed @clerk/types version predates this and
      // doesn't type `email_code` as a second-factor option even though the
      // Clerk runtime supports it, hence the casts below.
      console.log("[SchoolSignIn] signIn.create non-complete", {
        status: result.status,
        supportedSecondFactors: result.supportedSecondFactors,
      });

      const factors = (result.supportedSecondFactors ?? []) as unknown as Array<{
        strategy: string;
        emailAddressId?: string;
      }>;
      const emailFactor = factors.find((f) => f.strategy === "email_code");

      if (emailFactor) {
        try {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          } as never);
          console.log("[SchoolSignIn] prepareSecondFactor(email_code) succeeded");
          setPendingSecondFactor(true);
        } catch (prepareErr) {
          console.error(
            "[SchoolSignIn] prepareSecondFactor(email_code) failed",
            prepareErr,
          );
          setError("Additional verification required. Please try again.");
        }
      } else {
        console.error(
          "[SchoolSignIn] no usable second factor in supportedSecondFactors",
          factors,
        );
        setError(
          "We couldn't complete sign-in verification automatically. Please contact support.",
        );
      }
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "errors" in err &&
        Array.isArray((err as { errors: { message: string }[] }).errors)
          ? (err as { errors: { message: string }[] }).errors[0]?.message
          : "Invalid credentials. Please try again.";
      setError(msg ?? "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifySecondFactor(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setSubmitting(true);
    try {
      const attempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      } as never);
      console.log("[SchoolSignIn] attemptSecondFactor result", attempt.status);
      if (attempt.status === "complete") {
        await completeSignIn(attempt.createdSessionId);
      } else {
        console.error(
          "[SchoolSignIn] attemptSecondFactor non-complete",
          attempt.status,
        );
        setError("Verification could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      console.error("[SchoolSignIn] attemptSecondFactor failed", err);
      const msg =
        err &&
        typeof err === "object" &&
        "errors" in err &&
        Array.isArray((err as { errors: { message: string }[] }).errors)
          ? (err as { errors: { message: string }[] }).errors[0]?.message
          : "Invalid code. Please try again.";
      setError(msg ?? "Invalid code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-[#e8e4dc] bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1
            className="mb-1 text-xl md:text-2xl font-semibold tracking-tight"
            style={{ color: "#333f48" }}
          >
            {pendingSecondFactor ? (
              "Verify it's you"
            ) : (
              <>
                <span className="md:hidden">Sign into your University of Texas at Austin co-foundr matching account</span>
                <span className="hidden md:inline">Sign into University of Texas at Austin Co-foundr Matching Engine</span>
              </>
            )}
          </h1>
          <p className="text-sm" style={{ color: "#9cadb7" }}>
            {pendingSecondFactor
              ? `We sent a 6-digit code to ${email}.`
              : `Use your ${allowedCopy} account.`}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!pendingSecondFactor ? (
          <>
            <div className="mb-4">
              <GoogleOAuthButton slug={slug} mode="signIn" />
            </div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1" style={{ backgroundColor: "#e8e4dc" }} />
              <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#9cadb7" }}>
                or
              </span>
              <div className="h-px flex-1" style={{ backgroundColor: "#e8e4dc" }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-medium"
                  style={{ color: "#333f48" }}
                >
                  School email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@utexas.edu"
                  className="w-full rounded-lg border border-[#e8e4dc] px-3 py-2 text-sm outline-none transition focus:border-[#bf5700] focus:ring-2 focus:ring-[#bf5700]/20"
                  required
                />
                {showGoogleHint && (
                  <p className="mt-1.5 text-xs" style={{ color: "#7a3a00" }}>
                    This account uses Google sign-in. Use the button above.
                  </p>
                )}
              </div>

              {showPasswordField && (
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-xs font-medium"
                    style={{ color: "#333f48" }}
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-[#e8e4dc] px-3 py-2 text-sm outline-none transition focus:border-[#bf5700] focus:ring-2 focus:ring-[#bf5700]/20"
                    required={showPasswordField}
                  />
                </div>
              )}

              <div id="clerk-captcha" />

              {showPasswordField && (
                <button
                  type="submit"
                  disabled={submitting || !isLoaded}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#bf5700" }}
                >
                  {submitting ? "Signing in…" : "Sign in"}
                </button>
              )}
            </form>
          </>
        ) : (
          <form onSubmit={handleVerifySecondFactor} className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className="mb-1 block text-xs font-medium"
                style={{ color: "#333f48" }}
              >
                Verification code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-lg border border-[#e8e4dc] px-3 py-2 text-base tracking-[0.5em] outline-none transition focus:border-[#bf5700] focus:ring-2 focus:ring-[#bf5700]/20"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !isLoaded}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#bf5700" }}
            >
              {submitting ? "Verifying…" : "Verify and continue"}
            </button>
          </form>
        )}

        <div
          className="mt-6 border-t pt-4 text-center text-xs"
          style={{ borderColor: "#e8e4dc", color: "#9cadb7" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href={`/school/${slug}/sign-up`}
            className="font-semibold hover:underline"
            style={{ color: "#bf5700" }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
