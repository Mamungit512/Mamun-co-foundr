"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

type OnboardingProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  completedSteps?: Set<number>;
};

const STEP_LABELS = [
  "Photo",
  "About",
  "Startup",
  "Background",
  "Interests",
  "Review",
];

export default function OnboardingProgressBar({
  currentStep,
  totalSteps,
  onStepClick,
  completedSteps,
}: OnboardingProgressBarProps) {
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // One connector line per gap between dots (totalSteps - 1)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Animate connector lines: each line between dot i and i+1 fills when
  // currentStep > i + 1 (i.e. the user has passed that gap).
  useEffect(() => {
    lineRefs.current.forEach((line, i) => {
      if (!line) return;
      const shouldFill = currentStep > i + 1;
      gsap.to(line, {
        width: shouldFill ? "100%" : "0%",
        duration: 0.55,
        ease: "back.out(1.4)",
      });
    });
  }, [currentStep]);

  // Pop the newly active dot
  useEffect(() => {
    const dot = dotRefs.current[currentStep - 1];
    if (!dot) return;
    gsap.fromTo(
      dot,
      { scale: 0.7 },
      { scale: 1, duration: 0.45, ease: "back.out(2.2)" },
    );
  }, [currentStep]);

  return (
    <div className="mb-10 w-full">
      {/* Dots + connectors in one row */}
      <div className="flex items-center">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isComplete = completedSteps
            ? completedSteps.has(stepNum)
            : stepNum < currentStep;
          const isActive = stepNum === currentStep;
          // All non-active steps are navigable when a click handler is provided
          const isClickable = !isActive && !!onStepClick;

          return (
            <React.Fragment key={i}>
              {/* Connector line before this dot (skip for first dot) */}
              {i > 0 && (
                <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-[var(--ui-surface)]">
                  <div
                    ref={(el) => {
                      lineRefs.current[i - 1] = el;
                    }}
                    className="absolute left-0 top-0 h-full rounded-full bg-[var(--ui-btn-bg)]"
                    // Initialise synchronously so GSAP always transitions from the right start value
                    style={{ width: currentStep > i + 1 ? "100%" : "0%" }}
                  />
                </div>
              )}

              {/* Step dot */}
              <button
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(stepNum)}
                title={STEP_LABELS[i]}
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300",
                  isComplete
                    ? "cursor-pointer bg-[var(--ui-btn-bg)] text-[var(--ui-btn-text)] hover:bg-[var(--ui-surface)]"
                    : isActive
                      ? "cursor-default bg-[var(--ui-surface-active)] text-[var(--ui-text)] ring-2 ring-[var(--ui-border-strong)] ring-offset-2 ring-offset-[var(--org-bg,transparent)]"
                      : isClickable
                        ? "cursor-pointer bg-[var(--ui-surface)] text-[var(--ui-text-subtle)] hover:bg-[var(--ui-surface)] hover:text-[var(--ui-text-muted)]"
                        : "cursor-default bg-[var(--ui-surface)] text-[var(--ui-text-subtle)]",
                ].join(" ")}
              >
                {isComplete ? (
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Label row */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-medium tracking-widest text-[var(--ui-text-subtle)] uppercase">
          {STEP_LABELS[currentStep - 1]}
        </span>
        <span className="text-xs text-[var(--ui-text-subtle)]">
          {currentStep} / {totalSteps}
        </span>
      </div>
    </div>
  );
}
