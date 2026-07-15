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
  checkExistingUser,
  type ExistingUserInfo,
} from "@/features/school/auth/school-auth";
import { completeSchoolSignIn } from "./complete-school-signin";

type Props = {
  slug: string;
  schoolName: string;
  allowedDomains: string[];
  initialEmail?: string;
  afterAuthRedirect?: string | null;
};

/** Pull Clerk's first error message off a thrown error, with a fallback. */
function clerkErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "errors" in err &&
    Array.isArray((err as { errors: { message: string }[] }).errors)
  ) {
    return (
      (err as { errors: { message: string }[] }).errors[0]?.message ?? fallback
    );
  }
  return fallback;
}

export default function SchoolResetPassword({
  slug,
  schoolName,
  allowedDomains,
  initialEmail = "",
  afterAuthRedirect = null,
}: Props) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { getToken } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secondFactorCode, setSecondFactorCode] = useState("");
  // Flow phases: "request" → "reset" → (optional) "secondFactor".
  const [pendingReset, setPendingReset] = useState(false);
  const [pendingSecondFactor, setPendingSecondFactor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingUser, setExistingUser] = useState<ExistingUserInfo>({
    exists: false,
    hasPassword: false,
    oauthProviders: [],
  });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const allowedCopy = formatAllowedDomainsForCopy(allowedDomains);
  const existingHasGoogle = existingUser.oauthProviders.includes("oauth_google");
  // A Google-only account has no password to reset — steer them back to Google.
  const isGoogleOnly =
    existingUser.exists && existingHasGoogle && !existingUser.hasPassword;

  useEffect(() => {
    if (pendingReset) return;
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
  }, [email, allowedDomains, pendingReset]);

  async function finish(sessionId: string | null) {
    // setActive is guaranteed defined here: reached only after `isLoaded`.
    const { error: assignError } = await completeSchoolSignIn({
      setActive: setActive!,
      getToken,
      router,
      slug,
      sessionId,
      afterAuthRedirect,
    });
    if (assignError) setError(assignError);
  }

  async function handleRequest(e: React.FormEvent) {
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
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setPendingReset(true);
    } catch (err: unknown) {
      setError(
        clerkErrorMessage(
          err,
          "We couldn't send a reset code. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await finish(result.createdSessionId);
        return;
      }

      // Account-level MFA can require a second factor after the reset. Mirror
      // SchoolSignIn's email_code handling. The installed @clerk/types predates
      // email_code as a typed second factor, hence the casts.
      if (result.status === "needs_second_factor") {
        const factors = (result.supportedSecondFactors ??
          []) as unknown as Array<{
          strategy: string;
          emailAddressId?: string;
        }>;
        const emailFactor = factors.find((f) => f.strategy === "email_code");
        if (emailFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          } as never);
          setPendingSecondFactor(true);
        } else {
          setError(
            "Additional verification is required. Please contact support.",
          );
        }
        return;
      }

      setError("We couldn't reset your password. Please try again.");
    } catch (err: unknown) {
      setError(clerkErrorMessage(err, "Invalid or expired code. Try again."));
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
        code: secondFactorCode,
      } as never);
      if (attempt.status === "complete") {
        await finish(attempt.createdSessionId);
      } else {
        setError("Verification could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      setError(clerkErrorMessage(err, "Invalid code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  const heading = pendingSecondFactor
    ? "Verify it's you"
    : pendingReset
      ? "Check your email"
      : "Reset your password";
  const subtitle = pendingSecondFactor
    ? `We sent a verification code to ${email}.`
    : pendingReset
      ? `We sent a 6-digit code to ${email}. Enter it with a new password.`
      : `Enter your ${allowedCopy} email and we'll send a reset code.`;

  const inputClass =
    "w-full rounded-lg border border-[#e8e4dc] px-3 py-2 text-sm outline-none transition focus:border-[#bf5700] focus:ring-2 focus:ring-[#bf5700]/20";
  const codeInputClass =
    "w-full rounded-lg border border-[#e8e4dc] px-3 py-2 text-base tracking-[0.5em] outline-none transition focus:border-[#bf5700] focus:ring-2 focus:ring-[#bf5700]/20";
  const labelClass = "mb-1 block text-xs font-medium";
  const buttonClass =
    "w-full rounded-lg bg-[#bf5700] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a34800] disabled:opacity-50";

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-[#e8e4dc] bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1
            className="mb-1 text-xl font-semibold tracking-tight md:text-2xl"
            style={{ color: "#333f48" }}
          >
            {heading}
          </h1>
          <p className="text-sm" style={{ color: "#5f7280" }}>
            {subtitle}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {pendingSecondFactor ? (
          <form onSubmit={handleVerifySecondFactor} className="space-y-4">
            <div>
              <label
                htmlFor="sf-code"
                className={labelClass}
                style={{ color: "#333f48" }}
              >
                Verification code
              </label>
              <input
                id="sf-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                value={secondFactorCode}
                onChange={(e) => setSecondFactorCode(e.target.value)}
                className={codeInputClass}
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !isLoaded}
              className={buttonClass}
            >
              {submitting ? "Verifying…" : "Verify and continue"}
            </button>
          </form>
        ) : pendingReset ? (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className={labelClass}
                style={{ color: "#333f48" }}
              >
                Reset code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={codeInputClass}
                maxLength={6}
                required
              />
            </div>
            <div>
              <label
                htmlFor="new-password"
                className={labelClass}
                style={{ color: "#333f48" }}
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                minLength={8}
                required
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className={labelClass}
                style={{ color: "#333f48" }}
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                minLength={8}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !isLoaded}
              className={buttonClass}
            >
              {submitting ? "Resetting…" : "Reset password"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className={labelClass}
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
                className={inputClass}
                required
              />
              {isGoogleOnly && (
                <p className="mt-1.5 text-xs" style={{ color: "#7a3a00" }}>
                  This account uses Google sign-in, so there&apos;s no password
                  to reset.{" "}
                  <Link
                    href={`/school/${slug}/sign-in`}
                    className="font-semibold hover:underline"
                    style={{ color: "#bf5700" }}
                  >
                    Go to sign in
                  </Link>
                  .
                </p>
              )}
            </div>

            <div id="clerk-captcha" />

            {!isGoogleOnly && (
              <button
                type="submit"
                disabled={submitting || !isLoaded}
                className={buttonClass}
              >
                {submitting ? "Sending code…" : "Send reset code"}
              </button>
            )}
          </form>
        )}

        <div
          className="mt-6 border-t pt-4 text-center text-xs"
          style={{ borderColor: "#e8e4dc", color: "#5f7280" }}
        >
          Remember your password?{" "}
          <Link
            href={`/school/${slug}/sign-in`}
            className="font-semibold hover:underline"
            style={{ color: "#bf5700" }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
