type OnboardingProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export default function OnboardingProgressBar({
  currentStep,
  totalSteps,
}: OnboardingProgressBarProps) {
  return (
    <div className="mb-6 w-full">
      <div className="mb-2 flex items-center gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < currentStep ? "bg-white" : "bg-white/20"
            }`}
          />
        ))}
      </div>
      <p className="text-right text-xs text-white/50">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}
