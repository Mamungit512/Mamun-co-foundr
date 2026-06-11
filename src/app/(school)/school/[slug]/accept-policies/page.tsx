"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useSchool } from "@/features/school/components/SchoolContext";
import {
  getRequiredConsents,
  type ConsentDocument,
} from "@/features/legal/consent";
import { recordPrivacyPolicyConsent } from "./_actions";

const DOCUMENT_META: Record<
  ConsentDocument,
  { label: string; href: (slug: string) => string }
> = {
  privacy_policy: {
    label: "Privacy Policy",
    href: (slug) => `/school/${slug}/privacy-policy`,
  },
};

export default function AcceptPoliciesPage() {
  const { slug, schoolName, config } = useSchool();
  const router = useRouter();
  const searchParams = useSearchParams();

  const required = useMemo(() => getRequiredConsents(slug), [slug]);

  const [agreed, setAgreed] = useState<Record<ConsentDocument, boolean>>(
    () =>
      Object.fromEntries(required.map((c) => [c.document, false])) as Record<
        ConsentDocument,
        boolean
      >,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAgreed = required.every((c) => agreed[c.document]);
  const primary = config.branding.primaryColor;

  async function handleContinue() {
    if (!allAgreed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await recordPrivacyPolicyConsent(slug);
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

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-4 py-8">
      <div className="w-full rounded-2xl border border-[var(--ui-border,#e8e4dc)] bg-white p-8 shadow-sm">
        <h1
          className="mb-1 text-xl font-semibold tracking-tight md:text-2xl"
          style={{ color: "#333f48" }}
        >
          Before you continue
        </h1>
        <p className="mb-6 text-sm" style={{ color: "#9cadb7" }}>
          To use {schoolName} Co-Founder Matching, please review and accept the
          following.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {required.map((c) => {
            const meta = DOCUMENT_META[c.document];
            return (
              <label
                key={c.document}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#e8e4dc] p-3 text-sm"
                style={{ color: "#333f48" }}
              >
                <input
                  type="checkbox"
                  checked={agreed[c.document]}
                  onChange={(e) =>
                    setAgreed((prev) => ({
                      ...prev,
                      [c.document]: e.target.checked,
                    }))
                  }
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ accentColor: primary }}
                />
                <span>
                  I have read and agree to the{" "}
                  <Link
                    href={meta.href(slug)}
                    target="_blank"
                    className="font-medium underline hover:opacity-70"
                    style={{ color: primary }}
                  >
                    {meta.label}
                  </Link>
                  .
                </span>
              </label>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!allAgreed || submitting}
          className="mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: primary }}
        >
          {submitting ? "Saving…" : "Agree and continue"}
        </button>
      </div>
    </div>
  );
}
