type OnboardingProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
};

export default function OnboardingProgressBar({
  currentStep,
  totalSteps,
  onStepClick,
}: OnboardingProgressBarProps) {
  return (
    <div className="mb-6 w-full">
      <div className="mb-2 flex items-center gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isFilled = i < currentStep;
          const isClickable = isFilled && !!onStepClick;
          return (
            <button
              key={i}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(i + 1)}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                isFilled ? "bg-white" : "bg-white/20"
              } ${isClickable ? "cursor-pointer hover:bg-white/70" : "cursor-default"}`}
            />
          );
        })}
      </div>
      <p className="text-right text-xs text-white/50">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}
