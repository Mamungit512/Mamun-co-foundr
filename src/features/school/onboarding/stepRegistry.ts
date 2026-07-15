import type { ComponentType } from "react";
import type { OnboardingStepId } from "@/features/school/registry/types";
import UTProfilePhotoForm from "@/features/school/onboarding/components/UTProfilePhotoForm";
import UTAboutYouForm from "@/features/school/onboarding/components/UTAboutYouForm";
import UTStartupForm from "@/features/school/onboarding/components/UTStartupForm";
import UTBackgroundAndSocialsForm from "@/features/school/onboarding/components/UTBackgroundAndSocialsForm";
import UTInterestsForm from "@/features/school/onboarding/components/UTInterestsForm";

export type StepProps = {
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
  defaultValues: OnboardingData;
};

// "review" is excluded — it has a distinct prop shape and is rendered separately.
type StepStepId = Exclude<OnboardingStepId, "review">;

export const STEP_COMPONENTS: Record<StepStepId, ComponentType<StepProps>> = {
  photo: UTProfilePhotoForm as ComponentType<StepProps>,
  about: UTAboutYouForm as ComponentType<StepProps>,
  startup: UTStartupForm as ComponentType<StepProps>,
  background: UTBackgroundAndSocialsForm as ComponentType<StepProps>,
  priorities: UTInterestsForm as ComponentType<StepProps>,
};
