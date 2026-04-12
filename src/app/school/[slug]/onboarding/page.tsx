"use client";

import { useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { completeOnboarding } from "@/app/onboarding/_actions";
import { useProfileUpsert } from "@/features/profile/useProfile";
import ProfilePhotoForm from "@/app/onboarding/form-components/ProfilePhotoForm";
import AboutYouForm from "@/app/onboarding/form-components/AboutYouForm";
import BackgroundAndSocialsForm from "@/app/onboarding/form-components/BackgroundAndSocialsForm";
import InterestsAndValuesForm from "@/app/onboarding/form-components/InterestsAndValuesForm";
import ReviewForm from "@/app/onboarding/form-components/ReviewForm";
import OnboardingProgressBar from "@/components/ui/OnboardingProgressBar";
import { useStepTransition } from "@/hooks/useOnboardingAnimation";
import { useOnboardingDraft } from "@/hooks/useOnboardingDraft";
import { useSchool } from "@/components/school/SchoolContext";

// School onboarding skips the StartupForm — 5 steps instead of 6
const TOTAL_STEPS = 5;

// Step map: 1=Photo, 2=AboutYou, 3=Background&Socials, 4=Interests, 5=Review
function getCompletedSteps(
  data: OnboardingData,
  visited: Set<number>,
): Set<number> {
  const completed = new Set<number>();
  if (data.pfp_url) completed.add(1);
  if (
    data.firstName &&
    data.lastName &&
    data.title &&
    data.country &&
    data.city &&
    data.education &&
    data.experience &&
    data.personalIntro &&
    data.satisfaction &&
    data.batteryLevel &&
    data.isTechnical
  )
    completed.add(2);
  if (visited.has(3)) completed.add(3);
  if (visited.has(4)) completed.add(4);
  return completed;
}

export default function SchoolOnboardingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [stepNumber, setStepNumber] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const { schoolName } = useSchool();
  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();
  const draft = useOnboardingDraft();
  const { containerRef, transition } = useStepTransition();

  const { mutateAsync: upsertProfileMutationFn } = useProfileUpsert();

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

      const { success, error: upsertError } =
        await upsertProfileMutationFn(formData);

      if (!success) {
        setError(upsertError || "Failed to save profile. Please try again.");
        return;
      }

      await completeOnboarding(formData);
      await user?.reload();

      draft.clear();

      const resolvedParams = await params;
      router.push(`/school/${resolvedParams.slug}/dashboard`);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
          Mamun &times; {schoolName}
        </p>
        <h1 className="mt-1 text-xl font-semibold text-white">
          Co-Founder Matching
        </h1>
        <p className="mt-1 text-sm text-white/40">Student Profile Setup</p>
      </div>

      <OnboardingProgressBar
        currentStep={stepNumber}
        totalSteps={TOTAL_STEPS}
        onStepClick={handleEditStep}
        completedSteps={getCompletedSteps(formData, visitedSteps)}
      />

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div ref={containerRef} className="will-change-transform">
        {stepNumber === 1 && (
          <ProfilePhotoForm
            onNext={(newData) => advanceStep(newData, 2)}
            defaultValues={formData}
          />
        )}
        {stepNumber === 2 && (
          <AboutYouForm
            onBack={handleBack}
            onNext={(newData) => advanceStep(newData, 3)}
            defaultValues={formData}
          />
        )}
        {stepNumber === 3 && (
          <BackgroundAndSocialsForm
            onBack={handleBack}
            onNext={(newData) => advanceStep(newData, 4)}
            defaultValues={formData}
          />
        )}
        {stepNumber === 4 && (
          <InterestsAndValuesForm
            onBack={handleBack}
            onNext={(newData) => advanceStep(newData, 5)}
            defaultValues={formData}
          />
        )}
        {stepNumber === 5 && (
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
