"use client";

import { ADMIN_TABS, type AdminTab } from "./tabs";

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
              className="flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 pt-1 pb-3 text-sm font-medium whitespace-nowrap transition"
              style={
                isActive
                  ? {
                      borderColor: "var(--org-primary)",
                      color: "var(--org-primary)",
                    }
                  : {
                      borderColor: "transparent",
                      color: "var(--ui-text-muted)",
                    }
              }
            >
              {tab.label}
              {count !== undefined && count > 0 && (
                <span
                  className="font-normal"
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
