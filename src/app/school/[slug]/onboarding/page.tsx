"use client";

import { useState, useEffect, use } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { completeOnboarding } from "@/app/onboarding/_actions";
import { useUserProfile } from "@/features/profile/useProfile";
import ProfilePhotoForm from "@/app/onboarding/form-components/ProfilePhotoForm";
import UTProfilePhotoForm from "@/app/onboarding/form-components/UTProfilePhotoForm";
import AboutYouForm from "@/app/onboarding/form-components/AboutYouForm";
import BackgroundAndSocialsForm from "@/app/onboarding/form-components/BackgroundAndSocialsForm";
import InterestsAndValuesForm from "@/app/onboarding/form-components/InterestsAndValuesForm";
import ReviewForm from "@/app/onboarding/form-components/ReviewForm";
import UTAboutYouForm from "@/app/onboarding/form-components/UTAboutYouForm";
import UTStartupForm from "@/app/onboarding/form-components/UTStartupForm";
import UTBackgroundAndSocialsForm from "@/app/onboarding/form-components/UTBackgroundAndSocialsForm";
import UTReviewForm from "@/app/onboarding/form-components/UTReviewForm";
import OnboardingProgressBar from "@/components/ui/OnboardingProgressBar";
import { useStepTransition } from "@/hooks/useOnboardingAnimation";
import { useOnboardingDraft } from "@/hooks/useOnboardingDraft";
import { useSchool } from "@/components/school/SchoolContext";

const TOTAL_STEPS = 5;

function getCompletedSteps(
  data: OnboardingData,
  visited: Set<number>,
  isUT: boolean,
): Set<number> {
  const completed = new Set<number>();
  if (data.pfp_url) completed.add(1);

  const step2BaseFields =
    data.firstName &&
    data.lastName &&
    data.title &&
    data.country &&
    data.city &&
    data.experience &&
    data.personalIntro &&
    data.isTechnical;

  if (isUT) {
    if (step2BaseFields && data.utStatus) completed.add(2);
    // Step 3: intent is always required; startup details only when hasStartup=yes
    if (
      data.hasStartup !== undefined &&
      data.intent !== undefined &&
      (data.hasStartup === "no" ||
        (data.hasStartup === "yes" &&
          data.coFounderStatus !== undefined &&
          data.equityExpectation !== undefined))
    ) {
      completed.add(3);
    }
  } else {
    if (
      step2BaseFields &&
      data.education &&
      data.satisfaction &&
      data.batteryLevel
    )
      completed.add(2);
  }

  if (visited.has(4)) completed.add(4);
  if (visited.has(5)) completed.add(5);
  return completed;
}

export default function SchoolOnboardingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const isUT = slug === "ut";

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

      const endpoint = isUT ? "/api/ut-profile" : "/api/profile";
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
        totalSteps={TOTAL_STEPS}
        onStepClick={handleEditStep}
        completedSteps={getCompletedSteps(formData, visitedSteps, isUT)}
      />

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div ref={containerRef} className="will-change-transform">
        {stepNumber === 1 && (
          isUT ? (
            <UTProfilePhotoForm
              onNext={(newData) => advanceStep(newData, 2)}
              defaultValues={formData}
            />
          ) : (
            <ProfilePhotoForm
              onNext={(newData) => advanceStep(newData, 2)}
              defaultValues={formData}
            />
          )
        )}
        {stepNumber === 2 && (
          isUT ? (
            <UTAboutYouForm
              onBack={handleBack}
              onNext={(newData) => advanceStep(newData, 3)}
              defaultValues={formData}
            />
          ) : (
            <AboutYouForm
              onBack={handleBack}
              onNext={(newData) => advanceStep(newData, 3)}
              defaultValues={formData}
            />
          )
        )}
        {stepNumber === 3 && isUT && (
          <UTStartupForm
            onBack={handleBack}
            onNext={(newData) => advanceStep(newData, 4)}
            defaultValues={formData}
          />
        )}
        {stepNumber === 4 && (
          isUT ? (
            <UTBackgroundAndSocialsForm
              onBack={handleBack}
              onNext={(newData) => advanceStep(newData, 5)}
              defaultValues={formData}
            />
          ) : (
            <BackgroundAndSocialsForm
              onBack={handleBack}
              onNext={(newData) => advanceStep(newData, 4)}
              defaultValues={formData}
            />
          )
        )}
        {stepNumber === 5 && !isUT && (
          <InterestsAndValuesForm
            onBack={handleBack}
            onNext={(newData) => advanceStep(newData, 5)}
            defaultValues={formData}
          />
        )}
        {stepNumber === 5 && isUT && (
          <UTReviewForm
            data={formData}
            onBack={handleBack}
            onEdit={handleEditStep}
            onSubmit={handleSubmit}
          />
        )}
        {stepNumber === 5 && !isUT && (
          <ReviewForm
            data={formData}
            onBack={handleBack}
            onEdit={handleEditStep}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
