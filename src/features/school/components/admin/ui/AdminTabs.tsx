"use client";

import { ADMIN_TABS, type AdminTab } from "../lib/tabConfig";

type Props = {
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  // Shown after the label when greater than zero, e.g. "Roster 48".
  counts?: Partial<Record<AdminTab, number>>;
};

export default function AdminTabs({ activeTab, onSelect, counts = {} }: Props) {
  return (
    <div className="mb-6 border-b" style={{ borderColor: "var(--ui-border)" }}>
      <nav
        role="tablist"
        aria-label="Admin sections"
        className="-mb-px flex gap-6 overflow-x-auto"
      >
        {ADMIN_TABS.filter((tab) => !tab.hidden).map((tab) => {
          const isActive = tab.id === activeTab;
          const count = counts[tab.id];
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(tab.id)}
              className={`relative flex shrink-0 cursor-pointer items-center gap-1.5 pt-1 pb-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-[var(--org-primary)] after:transition-transform after:duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--org-primary)] ${
                isActive
                  ? "text-[color:var(--org-primary)] after:scale-x-100"
                  : "text-[color:var(--ui-text-muted)] after:scale-x-0 hover:text-[color:var(--ui-text)]"
              }`}
            >
              {tab.label}
              {count !== undefined && count > 0 && (
                <span
                  className="font-normal tabular-nums"
                  style={{ color: "var(--ui-text-subtle)" }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
