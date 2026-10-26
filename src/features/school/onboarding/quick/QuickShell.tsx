"use client";

import React, { forwardRef } from "react";
import { Check } from "lucide-react";
import { SHELL_COPY, TOTAL_STEPS } from "@/features/school/onboarding/quick/constants";
import {
  BACK_CLS,
  BTN_CLS,
  EYEBROW_CLS,
  SECTION_LABEL_CLS,
} from "@/features/school/onboarding/quick/ui";

/** Page frame: eyebrow + title, an optional banner, then main column and sticky side column. */
export function QuickShell({
  title = SHELL_COPY.title,
  sub = SHELL_COPY.sub,
  hideHeading = false,
  banner,
  side,
  children,
}: {
  title?: string;
  sub?: string;
  hideHeading?: boolean;
  banner?: React.ReactNode;
  side?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-1 flex-col bg-[var(--org-bg)] text-[var(--ui-text)]">
      <div className="mx-auto w-full max-w-[1060px] px-4 pt-6 pb-14 sm:px-7 sm:pt-8">
        <div className="mb-5 flex flex-col gap-2">
          <p className={EYEBROW_CLS}>{SHELL_COPY.eyebrow}</p>
          {!hideHeading && (
            <>
              <h1 className="text-[26px] leading-tight font-semibold sm:text-3xl">{title}</h1>
              <p className="max-w-[560px] text-sm leading-relaxed text-[var(--ui-text-muted)]">{sub}</p>
            </>
          )}
        </div>

        {banner}

        {side ? (
          <div className="grid items-start gap-7 min-[901px]:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0">{children}</div>
            <aside className="flex flex-col gap-3.5 min-[901px]:sticky min-[901px]:top-[76px]">{side}</aside>
          </div>
        ) : hideHeading ? (
          children
        ) : (
          <div className="max-w-[680px]">{children}</div>
        )}
      </div>
    </div>
  );
}

/** Side column during steps 1–4: the live Fit Card preview. */
export function PreviewPanel({ children }: { children: React.ReactNode }) {
  return (
    <div aria-label="Fit Card preview" className="flex flex-col gap-2.5">
      <div className={SECTION_LABEL_CLS}>Your Fit Card · fills in as you answer</div>
      {children}
    </div>
  );
}

/** Dismissible notice / resume banner above the card. */
export function Banner({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--org-bg)] px-4 py-3.5">
      <div className="text-[13px] leading-relaxed text-[var(--ui-text-muted)]">{children}</div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}

type StepCardProps = {
  step: number;
  saved?: boolean;
  title: string;
  help: React.ReactNode;
  children: React.ReactNode;
  onBack?: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled: boolean;
  busy?: boolean;
  missing: string;
  error?: string | null;
};

/** The white step card: progress header, heading, the step's questions, and the footer. */
export const StepCard = forwardRef<HTMLHeadingElement, StepCardProps>(function StepCard(
  {
    step,
    saved = false,
    title,
    help,
    children,
    onBack,
    primaryLabel,
    onPrimary,
    primaryDisabled,
    busy = false,
    missing,
    error,
  },
  headingRef,
) {
  return (
    <div className="flex scroll-mt-20 flex-col gap-5 rounded-2xl border border-[var(--ui-border)] bg-[var(--org-bg)] p-[18px] sm:p-[26px]">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-[var(--ui-text-muted)]">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span
            aria-live="polite"
            className={`inline-flex items-center gap-1 font-semibold text-emerald-700 transition-opacity duration-200 ${saved ? "opacity-100" : "opacity-0"}`}
          >
            {saved && (
              <>
                <Check aria-hidden className="h-3.5 w-3.5" /> Saved
              </>
            )}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5" aria-hidden>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <i
              key={i}
              className={`h-1 rounded-sm ${i < step ? "bg-[var(--org-primary)]" : "bg-[var(--ui-border)]"}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mb-1.5 text-2xl leading-tight font-semibold outline-none"
          >
            {title}
          </h2>
          <div className="text-sm leading-relaxed text-[var(--ui-text-muted)]">{help}</div>
        </div>
        {children}
      </div>

      <div className="flex flex-col gap-2.5 border-t border-[var(--ui-border)] pt-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className={`${BACK_CLS} ${onBack ? "" : "invisible"}`}
            tabIndex={onBack ? 0 : -1}
          >
            ← Back
          </button>
          <button type="button" onClick={onPrimary} disabled={primaryDisabled || busy} className={BTN_CLS}>
            {busy ? "Saving…" : primaryLabel}
          </button>
        </div>
        {error && <p className="text-right text-xs font-semibold text-red-700">{error}</p>}
        <p aria-live="polite" className="min-h-[18px] text-right text-xs text-[var(--ui-text-muted)]">
          {missing}
        </p>
      </div>
    </div>
  );
});
