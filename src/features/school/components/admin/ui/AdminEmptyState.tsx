import type { ComponentType, CSSProperties, ReactNode } from "react";

type Props = {
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  title: string;
  hint?: string;
  action?: ReactNode;
  // Left-aligned inside a card, centred when it fills the page.
  compact?: boolean;
};

export default function AdminEmptyState({
  icon: Icon,
  title,
  hint,
  action,
  compact = false,
}: Props) {
  return (
    <div
      className={`admin-enter flex flex-col gap-3 ${
        compact ? "items-start" : "items-center py-16 text-center"
      }`}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--ui-surface-active)" }}
      >
        <Icon className="h-5 w-5" style={{ color: "var(--org-primary)" }} />
      </div>
      <p className="font-medium" style={{ color: "var(--ui-text)" }}>
        {title}
      </p>
      {hint && (
        <p
          className="max-w-md text-sm"
          style={{ color: "var(--ui-text-muted)" }}
        >
          {hint}
        </p>
      )}
      {action}
    </div>
  );
}
