"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCountUp } from "../lib/useCountUp";

export const adminCard = "rounded-xl border p-5";
export const adminCardStyle = {
  borderColor: "var(--ui-border)",
  backgroundColor: "var(--ui-surface)",
};

// Index drives the stagger: cards in a row enter one after another.
export function staggerStyle(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}

export function AdminBar({ value }: { value: number }) {
  return (
    <div
      className="mt-3 h-2 overflow-hidden rounded-full"
      style={{ backgroundColor: "var(--ui-border)" }}
      role="presentation"
    >
      <div
        className="admin-grow-x h-full rounded-full"
        style={{ width: `${value}%`, backgroundColor: "var(--org-primary)" }}
      />
    </div>
  );
}

type Props = {
  label: string;
  value: number;
  unit?: string;
  index?: number;
  // Draws attention with the org colour, e.g. a discrepancy worth noticing.
  highlight?: boolean;
  // Overview: label as a sentence, unit beside the number, children are free
  // form. Sources: small-caps label, unit under the number, children are a
  // caption.
  labelVariant?: "plain" | "caps";
  children?: ReactNode;
};

export default function AdminStatCard({
  label,
  value,
  unit,
  index = 0,
  highlight = false,
  labelVariant = "plain",
  children,
}: Props) {
  const shown = useCountUp(value);

  return (
    <div
      className={`admin-enter ${adminCard} transition-colors duration-200 hover:border-[color:var(--org-primary)] ${
        highlight
          ? "border-[color:var(--org-primary)]"
          : "border-[color:var(--ui-border)]"
      }`}
      style={{
        ...staggerStyle(index),
        backgroundColor: highlight
          ? "var(--ui-surface-active)"
          : "var(--ui-surface)",
      }}
    >
      <p
        className={
          labelVariant === "caps"
            ? "text-xs font-semibold tracking-wider uppercase"
            : "text-sm"
        }
        style={{ color: "var(--ui-text-muted)" }}
      >
        {label}
      </p>
      <p className="mt-2 flex items-baseline gap-2">
        <span
          className="text-4xl font-semibold tracking-tight tabular-nums"
          style={{ color: "var(--ui-text)" }}
          aria-hidden="true"
        >
          {shown}
        </span>
        <span className="sr-only">{value}</span>
        {unit && labelVariant === "plain" && (
          <span className="text-sm" style={{ color: "var(--ui-text-muted)" }}>
            {unit}
          </span>
        )}
      </p>
      {unit && labelVariant === "caps" && (
        <p className="text-sm" style={{ color: "var(--ui-text-muted)" }}>
          {unit}
        </p>
      )}
      {labelVariant === "caps" ? (
        <p className="mt-3 text-xs" style={{ color: "var(--ui-text-muted)" }}>
          {children}
        </p>
      ) : (
        children
      )}
    </div>
  );
}
