"use client";

import type { ReactNode, ButtonHTMLAttributes } from "react";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export default function AdminPageHeader({ title, subtitle, actions }: Props) {
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

export function AdminSecondaryButton({
  className = "",
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition hover:bg-[var(--ui-surface)] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={{
        borderColor: "var(--ui-border-strong)",
        color: "var(--ui-text)",
        ...style,
      }}
    />
  );
}
