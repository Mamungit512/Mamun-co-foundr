"use client";

import { useState, useEffect, use } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { completeOnboarding } from "@/app/(general)/onboarding/_actions";
import { useUserProfile } from "@/features/profile/useProfile";
import UTReviewForm from "@/features/school/onboarding/components/UTReviewForm";
import OnboardingProgressBar from "@/components/ui/OnboardingProgressBar";
import { useStepTransition } from "@/hooks/useOnboardingAnimation";
import { useOnboardingDraft } from "@/hooks/useOnboardingDraft";
import { useSchool } from "@/features/school/components/SchoolContext";
import { getOrgConfig, STEP3_COMPLETIONS } from "@/features/school/registry/registry";
import { getCompletedSteps } from "@/features/school/onboarding/getCompletedSteps";
import { STEP_COMPONENTS } from "@/features/school/onboarding/stepRegistry";

export default function SchoolOnboardingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const orgConfig = getOrgConfig(slug);

  const [stepNumber, setStepNumber] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [preFilledNotice, setPreFilledNotice] = useState(false);

  const { schoolName } = useSchool();
  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();
  const draft = useOnboardingDraft();
  const { containerRef, transition } = useStepTransition();
  const { data: existingProfile, isLoading: profileLoading } = useUserProfile();

  useEffect(() => {
    if (initialized || profileLoading) return;
    const savedDraft = draft.load();
    if (savedDraft) {
      setStepNumber(savedDraft.step);
      setFormData(savedDraft.data);
      const visited = new Set<number>();
      for (let i = 1; i < savedDraft.step; i++) visited.add(i);
      setVisitedSteps(visited);
    } else if (
      existingProfile &&
      (existingProfile.firstName || existingProfile.personalIntro || existingProfile.pfp_url)
    ) {
      setFormData(existingProfile);
      setPreFilledNotice(true);
    }
    setInitialized(true);
  }, [initialized, profileLoading, existingProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToStep = (
    newStep: number,
    dir: "forward" | "back",
    newData: Partial<OnboardingData> = {},
  ) => {
    const merged = { ...formData, ...newData };
    transition(dir, () => {
      setFormData(merged);
      setStepNumber(newStep);
      draft.save(newStep, merged);
    });
  };

  const advanceStep = (newData: Partial<OnboardingData>, nextStep: number) => {
    setVisitedSteps((prev) => {
      const next = new Set(prev);
      next.add(stepNumber);
      return next;
    });
    goToStep(nextStep, "forward", newData);
  };

  const handleBack = () => goToStep(stepNumber - 1, "back");

  const handleEditStep = (step: number) =>
    goToStep(step, step < stepNumber ? "back" : "forward");

  const handleSubmit = async () => {
    try {
      const userId = user?.id;
      const token = await session?.getToken();

      if (!userId || !token) {
        setError("Session expired. Please refresh and try again.");
        return;
      }

      const endpoint = orgConfig?.onboarding.apiEndpoint ?? "/api/profile";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.error || "Failed to save profile. Please try again.");
        return;
      }

      await completeOnboarding(formData);
      await user?.reload();

      draft.clear();

      router.push(`/school/${slug}/dashboard`);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  if (!initialized) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--ui-border)] border-t-[var(--org-primary)]" />
      </div>
    );
  }

  const onboarding = orgConfig?.onboarding;
  const totalSteps = onboarding?.totalSteps ?? 5;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ui-text-subtle)]">
          Mamun &times; {schoolName}
        </p>
        <h1 className="mt-1 text-xl font-semibold text-[var(--ui-text)]">
          Co-Founder Matching
        </h1>
        <p className="mt-1 text-sm text-[var(--ui-text-muted)]">Student Profile Setup</p>
      </div>

      {preFilledNotice && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm text-[var(--ui-text-muted)]">
          <span>✦ Some fields were pre-filled from your existing profile — review and update as needed.</span>
          <button
            type="button"
            onClick={() => setPreFilledNotice(false)}
            className="shrink-0 text-[var(--ui-text-subtle)] hover:text-[var(--ui-text-muted)]"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <OnboardingProgressBar
        currentStep={stepNumber}
        totalSteps={totalSteps}
        onStepClick={handleEditStep}
        completedSteps={
          onboarding
            ? getCompletedSteps(formData, visitedSteps, onboarding, STEP3_COMPLETIONS[slug])
            : new Set<number>()
        }
      />

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div ref={containerRef} className="will-change-transform">
        {onboarding?.steps.map((stepId, index) => {
          const stepNum = index + 1;
          if (stepNumber !== stepNum) return null;

          if (stepId === "review") {
            return (
              <UTReviewForm
                key={stepId}
                data={formData}
                onBack={handleBack}
                onEdit={handleEditStep}
                onSubmit={handleSubmit}
              />
            );
          }

          const StepComponent = STEP_COMPONENTS[stepId];
          return (
            <StepComponent
              key={stepId}
              onNext={(newData) => advanceStep(newData, stepNum + 1)}
              onBack={stepNum > 1 ? handleBack : undefined}
              defaultValues={formData}
            />
          );
        })}
      </div>
    </div>
  );
}
