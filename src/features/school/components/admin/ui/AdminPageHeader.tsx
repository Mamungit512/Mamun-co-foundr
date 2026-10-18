"use client";

import type { ReactNode, ButtonHTMLAttributes } from "react";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  // A pulse when the numbers are current, a still dot when they are stale.
  liveStatus?: "fresh" | "stale";
};

export default function AdminPageHeader({
  title,
  subtitle,
  actions,
  liveStatus,
}: Props) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ color: "var(--ui-text)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--ui-text-muted)" }}
            >
              {liveStatus && (
                <span
                  aria-hidden="true"
                  className={`relative mr-2 inline-block h-2 w-2 rounded-full align-middle ${
                    liveStatus === "fresh" ? "admin-pulse-dot" : ""
                  }`}
                  style={{
                    backgroundColor:
                      liveStatus === "fresh"
                        ? "var(--org-primary)"
                        : "var(--ui-text-subtle)",
                  }}
                />
              )}
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      <p
        className="mt-4 border-l-2 border-amber-500/60 pl-3 text-xs"
        style={{ color: "var(--ui-text-muted)" }}
      >
        <strong className="font-semibold">FERPA:</strong> student records are
        restricted to authorized administrators. Do not share or redistribute
        them.
      </p>
    </div>
  );
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--org-primary)]";

export function AdminSecondaryButton({
  className = "",
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border border-[color:var(--ui-border-strong)] px-3.5 py-2 text-sm font-medium transition-[background-color,border-color,transform] duration-150 hover:border-[color:var(--org-primary)] hover:bg-[var(--ui-surface)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[color:var(--ui-border-strong)] disabled:active:scale-100 ${focusRing} ${className}`}
      style={{
        color: "var(--ui-text)",
        ...style,
      }}
    />
  );
}

export function AdminPrimaryButton({
  className = "",
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${focusRing} ${className}`}
      style={{
        backgroundColor: "var(--ui-btn-bg)",
        color: "var(--ui-btn-text)",
        ...style,
      }}
    />
  );
}
