"use client";

import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import { useStepEntry } from "@/hooks/useOnboardingAnimation";

// Shared styling for the quick onboarding. Colors come from the school
// layout's --org-* / --ui-* tokens; success/error/notice use Tailwind's
// emerald/red/amber like the rest of the UT forms.

export const FOCUS_CLS =
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--org-primary)]";

const SELECTABLE_BASE_CLS = `cursor-pointer border bg-[var(--org-bg)] text-[var(--ui-text)] transition-colors duration-150 ${FOCUS_CLS}`;
const UNSELECTED_CLS = "border-[var(--ui-border)] hover:border-[var(--ui-border-strong)]";
// A ring on top of the 1px border reads as a 2px selected border without
// shifting the layout.
const SELECTED_CLS =
  "border-[var(--org-primary)] bg-[var(--ui-surface-active)] font-semibold ring-1 ring-[var(--org-primary)]";

export const selectable = (pressed: boolean) =>
  `${SELECTABLE_BASE_CLS} ${pressed ? SELECTED_CLS : UNSELECTED_CLS}`;

export const INPUT_CLS = `h-12 w-full rounded-xl border border-[var(--ui-border)] bg-[var(--org-bg)] px-3.5 text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] transition-colors duration-150 hover:border-[var(--ui-border-strong)] focus:border-[var(--org-primary)] focus:outline-none`;

export const TEXTAREA_CLS = `min-h-[84px] w-full resize-y rounded-xl border border-[var(--ui-border)] bg-[var(--org-bg)] px-3.5 py-3 text-sm leading-relaxed text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] transition-colors duration-150 hover:border-[var(--ui-border-strong)] focus:border-[var(--org-primary)] focus:outline-none`;

const BTN_BASE_CLS = `inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold transition-all duration-200 ${FOCUS_CLS}`;
const BTN_PRIMARY_CLS = `${BTN_BASE_CLS} bg-[var(--ui-btn-bg)] text-[var(--ui-btn-text)] hover:bg-[var(--ui-btn-bg)]/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100`;
const BTN_GHOST_BASE_CLS = `${BTN_BASE_CLS} border border-[var(--ui-border)] bg-[var(--org-bg)] text-[var(--ui-text)] hover:border-[var(--org-primary)]`;
const SIZE_CLS = "h-12 px-6 text-sm";
const SIZE_SMALL_CLS = "h-9 px-3.5 text-[13px]";
const SIZE_BIG_CLS = "h-[52px] px-7 text-[15.5px]";

export const BTN_CLS = `${BTN_PRIMARY_CLS} ${SIZE_CLS}`;
export const BTN_BIG_CLS = `${BTN_PRIMARY_CLS} ${SIZE_BIG_CLS}`;
export const BTN_SMALL_CLS = `${BTN_PRIMARY_CLS} ${SIZE_SMALL_CLS}`;
export const BTN_GHOST_CLS = `${BTN_GHOST_BASE_CLS} ${SIZE_CLS}`;
export const BTN_GHOST_SMALL_CLS = `${BTN_GHOST_BASE_CLS} ${SIZE_SMALL_CLS}`;

export const LINK_CLS = `cursor-pointer rounded px-0.5 py-1 text-[13px] font-semibold text-[var(--org-primary)] underline underline-offset-2 ${FOCUS_CLS}`;

export const BACK_CLS = `cursor-pointer rounded px-1 py-2 text-sm text-[var(--ui-text-muted)] transition-colors hover:text-[var(--org-primary)] ${FOCUS_CLS}`;

export const EYEBROW_CLS =
  "text-xs font-semibold tracking-widest text-[var(--org-primary)] uppercase";

export const SECTION_LABEL_CLS =
  "text-[11px] font-bold tracking-widest text-[var(--ui-text-muted)] uppercase";

export const ERROR_CLS = "text-xs font-semibold text-red-700";

/** A question: bold label with an optional right-aligned hint, then its controls. */
export function QField({
  label,
  hint,
  htmlFor,
  children,
  className = "",
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const labelId = useId();
  const LabelTag = htmlFor ? "label" : "div";
  // Without an input to label, the question names its group of choices.
  const groupProps = htmlFor ? {} : { role: "group", "aria-labelledby": labelId };
  return (
    <div className={`flex flex-col gap-2.5 ${className}`} {...groupProps}>
      <LabelTag
        {...(htmlFor ? { htmlFor } : {})}
        className="flex items-baseline justify-between gap-2 text-sm font-semibold text-[var(--ui-text)]"
      >
        <span id={labelId}>{label}</span>
        {hint && (
          <small className="text-right text-xs font-normal text-[var(--ui-text-muted)]">
            {hint}
          </small>
        )}
      </LabelTag>
      {children}
    </div>
  );
}

export function Choice({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`min-h-12 rounded-xl px-2.5 py-2 text-sm ${selectable(pressed)}`}
    >
      {children}
    </button>
  );
}

export function Chip({
  pressed,
  onClick,
  children,
  small = false,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-full px-3.5 ${small ? "h-[34px] text-[13px]" : "h-[38px] text-[13.5px]"} ${selectable(pressed)}`}
    >
      {children}
    </button>
  );
}

/** Full-width option row: optional leading radio, a title and a description. */
export function OptionRow({
  pressed,
  onClick,
  title,
  description,
  radio = false,
  compact = false,
}: {
  pressed: boolean;
  onClick: () => void;
  title: string;
  description: string;
  radio?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex w-full gap-3.5 rounded-xl text-left font-normal ${compact ? "items-start px-3 py-2.5" : "items-center px-4 py-3"} ${selectable(pressed)}`}
    >
      {radio && (
        <span
          aria-hidden
          className={`h-[18px] w-[18px] shrink-0 rounded-full transition-all ${
            pressed
              ? "border-[5px] border-[var(--org-primary)] bg-[var(--org-bg)]"
              : "border-[1.5px] border-[var(--ui-text-subtle)]"
          }`}
        />
      )}
      <span>
        <span className={`block font-semibold ${compact ? "text-sm" : "text-[15px]"}`}>{title}</span>
        <span
          className={`mt-0.5 block leading-snug text-[var(--ui-text-muted)] ${compact ? "text-[12.5px]" : "text-[13px]"}`}
        >
          {description}
        </span>
      </span>
    </button>
  );
}

export function Avatar({
  name,
  src,
  size = 48,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--ui-surface-active)] font-bold text-[var(--org-primary)]"
      style={{ width: size, height: size, fontSize: Math.round(size / 3) }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

/** Fades and lifts its children in on mount, for answers revealed mid-step. */
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useStepEntry();
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState<React.ReactNode>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((next: React.ReactNode) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(next);
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), 3200);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const node = (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-6 left-1/2 z-[200] w-max max-w-[min(400px,calc(100vw-32px))] -translate-x-1/2 rounded-xl bg-[var(--org-primary)] px-5 py-3 text-center text-xs leading-relaxed text-white transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {message}
    </div>
  );

  return { toast: show, toastNode: node };
}

/** Modal sheet: centered on desktop, docked to the bottom on phones. */
export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("input, textarea, button:not([data-close])")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 sm:items-center sm:p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[88vh] w-full max-w-[480px] flex-col gap-3.5 overflow-y-auto rounded-t-2xl bg-[var(--ui-popover-bg)] p-5 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-2.5">
          <h3 id={titleId} className="text-xl font-semibold text-[var(--ui-text)]">
            {title}
          </h3>
          <button
            type="button"
            data-close
            aria-label="Close"
            onClick={onClose}
            className={`cursor-pointer rounded px-1.5 text-2xl leading-none text-[var(--ui-text-muted)] ${FOCUS_CLS}`}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`${INPUT_CLS} ${className}`} {...props} />
  ),
);
TextInput.displayName = "TextInput";
