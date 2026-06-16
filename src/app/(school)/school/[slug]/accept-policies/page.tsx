"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useSchool } from "@/features/school/components/SchoolContext";
import { recordPolicyConsents } from "./_actions";

export default function AcceptPoliciesPage() {
  const { slug, schoolName, config } = useSchool();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [checks, setChecks] = useState({
    policies: false,
    matching: false,
    consent: false,
    age: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allChecked = Object.values(checks).every(Boolean);
  const primary = config.branding.primaryColor;

  function toggle(key: keyof typeof checks) {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleContinue() {
    if (!allChecked || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await recordPolicyConsents(slug);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const redirect = searchParams.get("redirect");
      router.push(redirect ?? `/school/${slug}/dashboard`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const checkboxClass =
    "flex cursor-pointer items-start gap-3 rounded-lg border border-[#e8e4dc] p-3 text-sm";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-xl items-center px-4 py-8">
      <div
        className="w-full rounded-2xl border p-8 shadow-sm"
        style={{ borderColor: primary, backgroundColor: "#fff" }}
      >
        {/* Eyebrow */}
        <p
          className="mb-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: primary }}
        >
          Required before using the platform
        </p>

        {/* Heading */}
        <h1
          className="mb-3 text-2xl font-bold tracking-tight md:text-3xl"
          style={{ color: "#1a1a1a" }}
        >
          Agree to the Terms
        </h1>

        {/* Intro */}
        <p className="mb-6 text-sm leading-relaxed" style={{ color: "#6b7280" }}>
          Per Section 4 of this policy, every student must affirmatively complete the consent flow
          below before creating a profile. No data is collected before this step. Each box requires
          an independent action — nothing is pre-checked.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Checkbox 1 — links to both policies */}
          <label className={checkboxClass} style={{ color: "#1a1a1a" }}>
            <input
              type="checkbox"
              checked={checks.policies}
              onChange={() => toggle("policies")}
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ accentColor: primary }}
            />
            <span>
              I have read and agree to the {schoolName} University{" "}
              <Link
                href={`/school/${slug}/privacy-policy`}
                target="_blank"
                className="font-semibold underline hover:opacity-70"
                style={{ color: primary }}
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href={`/school/${slug}/terms-and-conditions`}
                target="_blank"
                className="font-semibold underline hover:opacity-70"
                style={{ color: primary }}
              >
                Terms of Use
              </Link>
              .
            </span>
          </label>

          {/* Checkbox 2 */}
          <label className={checkboxClass} style={{ color: "#1a1a1a" }}>
            <input
              type="checkbox"
              checked={checks.matching}
              onChange={() => toggle("matching")}
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ accentColor: primary }}
            />
            <span>
              I understand my profile data will be used for{" "}
              <strong>co-founder matching within my university cohort</strong>.
            </span>
          </label>

          {/* Checkbox 3 */}
          <label className={checkboxClass} style={{ color: "#1a1a1a" }}>
            <input
              type="checkbox"
              checked={checks.consent}
              onChange={() => toggle("consent")}
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ accentColor: primary }}
            />
            <span>
              I consent to the platform processing my data as described, and understand I may{" "}
              <strong>withdraw consent and delete my account at any time</strong>.
            </span>
          </label>

          {/* Checkbox 4 */}
          <label className={checkboxClass} style={{ color: "#1a1a1a" }}>
            <input
              type="checkbox"
              checked={checks.age}
              onChange={() => toggle("age")}
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ accentColor: primary }}
            />
            <span>
              I am <strong>18 years or older</strong> and currently enrolled at the partnering
              university.
            </span>
          </label>
        </div>

        {/* Button row */}
        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!allChecked || submitting}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: primary }}
          >
            {submitting ? "Saving…" : "I Agree & Continue"}
          </button>
          {!allChecked && (
            <p className="text-xs text-gray-400">Check all four boxes to continue</p>
          )}
        </div>
      </div>
    </div>
  );
}
