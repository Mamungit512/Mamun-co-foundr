"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth, useSignUp } from "@clerk/nextjs";
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
};

export default function SchoolSignUp({
  slug,
  schoolName,
  allowedDomains,
}: Props) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingUser, setExistingUser] = useState<ExistingUserInfo>({
    exists: false,
    hasPassword: false,
    oauthProviders: [],
  });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const allowedCopy = formatAllowedDomainsForCopy(allowedDomains);
  const emailExists = existingUser.exists;
  const existingHasGoogle = existingUser.oauthProviders.includes("oauth_google");
  const existingHasPassword = existingUser.hasPassword;

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);

    if (!isEmailDomainAllowed(email, allowedDomains)) {
      setError(
        `Sign-up at ${schoolName} requires a ${allowedCopy} email address.`,
      );
      return;
    }

    if (emailExists) {
      setError(
        `An account with this email already exists. Sign in instead to access ${schoolName}.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "errors" in err &&
        Array.isArray((err as { errors: { message: string }[] }).errors)
          ? (err as { errors: { message: string }[] }).errors[0]?.message
          : "Something went wrong. Please try again.";
      setError(msg ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setSubmitting(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        const result = await assignSchoolOrg(slug);
        if ("error" in result) {
          setError(result.error);
          return;
        }
        await getToken({ skipCache: true });
        router.push(`/school/${slug}/onboarding`);
      } else {
        setError("Verification could not be completed. Please try again.");
      }
    } catch (err: unknown) {
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
            {pendingVerification ? "Verify your email" : (
              <>
                <span className="md:hidden">Create your University of Texas at Austin co-foundr matching account</span>
                <span className="hidden md:inline">Create University of Texas at Austin Co-foundr Matching Engine account</span>
              </>
            )}
          </h1>
          <p className="text-sm" style={{ color: "#9cadb7" }}>
            {pendingVerification
              ? `We sent a 6-digit code to ${email}.`
              : `Sign up with your ${allowedCopy} email.`}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!pendingVerification ? (
          <>
            <div className="mb-4">
              <GoogleOAuthButton slug={slug} mode="signUp" />
            </div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1" style={{ backgroundColor: "#e8e4dc" }} />
              <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#9cadb7" }}>
                or
              </span>
              <div className="h-px flex-1" style={{ backgroundColor: "#e8e4dc" }} />
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1 block text-xs font-medium"
                  style={{ color: "#333f48" }}
                >
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-[#e8e4dc] px-3 py-2 text-sm outline-none transition focus:border-[#bf5700] focus:ring-2 focus:ring-[#bf5700]/20"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1 block text-xs font-medium"
                  style={{ color: "#333f48" }}
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-[#e8e4dc] px-3 py-2 text-sm outline-none transition focus:border-[#bf5700] focus:ring-2 focus:ring-[#bf5700]/20"
                  required
                />
              </div>
            </div>

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
              {emailExists && (
                <div className="mt-2 rounded-lg border border-[#f5d9c4] bg-[#fdf4ec] px-3 py-2.5 text-xs">
                  <p style={{ color: "#7a3a00" }}>
                    An account already exists for this email.{" "}
                    {existingHasGoogle && !existingHasPassword
                      ? "Sign in with Google to access " + schoolName + "."
                      : existingHasPassword && !existingHasGoogle
                        ? null
                        : "Choose how you'd like to sign in."}
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {existingHasGoogle && (
                      <GoogleOAuthButton slug={slug} mode="signIn" />
                    )}
                    {existingHasPassword && (
                      <Link
                        href={`/school/${slug}/sign-in`}
                        className="block rounded-lg px-4 py-2 text-center text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#bf5700" }}
                      >
                        Sign in with password
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#e8e4dc] px-3 py-2 text-sm outline-none transition focus:border-[#bf5700] focus:ring-2 focus:ring-[#bf5700]/20"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !isLoaded}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#bf5700" }}
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>

            <p className="text-center text-[11px]" style={{ color: "#9cadb7" }}>
              By creating an account, you agree to our{" "}
              <Link
                href="/privacy-policy"
                className="font-medium underline hover:opacity-70"
                style={{ color: "#9cadb7" }}
              >
                Privacy Policy
              </Link>
              .
            </p>
          </form>
          </>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
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
          Already have an account?{" "}
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
