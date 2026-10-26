"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

import { useSchool } from "@/features/school/components/SchoolContext";
import ConsentRows, {
  NO_CONSENT,
  consentMissing,
  type ConsentChecks,
} from "@/features/school/onboarding/quick/ConsentRows";
import FitCard from "@/features/school/onboarding/quick/FitCard";
import { PreviewPanel, QuickShell, StepCard } from "@/features/school/onboarding/quick/QuickShell";
import WelcomeCard from "@/features/school/onboarding/quick/WelcomeCard";
import { SCHOOL_SHORT_NAME } from "@/features/school/onboarding/quick/constants";
import { Avatar, BTN_CLS } from "@/features/school/onboarding/quick/ui";
import { recordPolicyConsents } from "./_actions";

const CONSENT_INTRO =
  "Per Section 4 of this policy, every student must affirmatively complete the consent flow below before creating a profile. No data is collected before this step. Each box requires an independent action — nothing is pre-checked.";

function maskEmail(email: string | undefined): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  return domain ? `${local.slice(0, 1)}•••@${domain}` : email;
}

export default function AcceptPoliciesPage() {
  const { slug, schoolName, orgId } = useSchool();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [started, setStarted] = useState(false);
  const [checks, setChecks] = useState<ConsentChecks>(NO_CONSENT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the step heading when "Get started" reveals step 1.
  useEffect(() => {
    if (started) headingRef.current?.focus({ preventScroll: true });
  }, [started]);

  const metadata = (user?.publicMetadata ?? {}) as {
    schoolOnboarding?: Record<string, boolean>;
    onboardingComplete?: boolean;
    organization_id?: string;
  };
  // Mirrors the middleware's schoolDone check: users who already finished
  // onboarding are only here because a policy version changed.
  const onboarded =
    metadata.schoolOnboarding?.[orgId] === true ||
    (metadata.onboardingComplete === true && metadata.organization_id === orgId);

  const missing = consentMissing(checks);
  const toggle = (key: keyof ConsentChecks) => setChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  async function handleContinue() {
    if (missing || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await recordPolicyConsents(slug);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const redirect = searchParams.get("redirect");
      if (onboarded) {
        router.push(redirect ?? `/school/${slug}/dashboard`);
      } else {
        const query = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
        router.push(`/school/${slug}/onboarding${query}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--ui-border)] border-t-[var(--org-primary)]" />
      </div>
    );
  }

  const consentRows = <ConsentRows slug={slug} schoolName={schoolName} checks={checks} onToggle={toggle} />;

  if (onboarded) {
    return (
      <QuickShell title="Agree to the Terms" sub={CONSENT_INTRO}>
        <div className="flex flex-col gap-5 rounded-2xl border border-[var(--ui-border)] bg-[var(--org-bg)] p-[18px] sm:p-[26px]">
          {consentRows}
          <div className="flex flex-col items-end gap-2.5 border-t border-[var(--ui-border)] pt-[18px]">
            <button type="button" onClick={handleContinue} disabled={!!missing || submitting} className={BTN_CLS}>
              {submitting ? "Saving…" : "Agree and continue"}
            </button>
            {error && <p className="text-xs font-semibold text-red-700">{error}</p>}
            <p aria-live="polite" className="min-h-[18px] text-xs text-[var(--ui-text-muted)]">
              {missing}
            </p>
          </div>
        </div>
      </QuickShell>
    );
  }

  if (!started) {
    return (
      <QuickShell hideHeading>
        <WelcomeCard onStart={() => setStarted(true)} />
      </QuickShell>
    );
  }

  const name = user?.fullName?.trim() || "";
  const previewData: OnboardingData = {
    firstName: user?.firstName ?? undefined,
    lastName: user?.lastName ?? undefined,
  };

  return (
    <QuickShell
      side={
        <PreviewPanel>
          <FitCard data={previewData} />
        </PreviewPanel>
      }
    >
      <StepCard
        ref={headingRef}
        step={1}
        title="You’re signed in. Four taps to agree."
        help={CONSENT_INTRO}
        primaryLabel="Agree and continue"
        onPrimary={handleContinue}
        primaryDisabled={!!missing}
        busy={submitting}
        missing={missing}
        error={error}
      >
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
          <Avatar name={name} src={user?.imageUrl && user.hasImage ? user.imageUrl : undefined} size={40} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold text-[var(--ui-text)]">{name || "Signed in"}</div>
            <div className="text-[12.5px] break-words text-emerald-800">
              {maskEmail(user?.primaryEmailAddress?.emailAddress)} · signed in with your {SCHOOL_SHORT_NAME} email
            </div>
          </div>
          <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-emerald-800">
            ✓ Verified {SCHOOL_SHORT_NAME}
          </span>
        </div>
        {consentRows}
      </StepCard>
    </QuickShell>
  );
}
