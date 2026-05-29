"use client";

import { useEffect, useMemo, type ChangeEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoCloseOutline, IoChevronDown } from "react-icons/io5";
import {
  UT_SCHOOLS_AND_PROGRAMS,
  SECTOR_INTEREST_LABELS,
  getSchoolLabel,
} from "@/lib/utSchoolsAndMajors";
import {
  type DashboardFilters,
  EMPTY_DASHBOARD_FILTERS,
  hasActiveFilters,
} from "@/lib/dashboardFilters";

const SELECT_CLS =
  "box-border w-full min-w-0 appearance-none rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] " +
  "py-2.5 pl-4 pr-10 text-sm text-[var(--ui-text)] " +
  "transition-all duration-200 focus:border-[var(--ui-border-strong)] focus:ring-2 focus:ring-[var(--ui-border)] focus:outline-none " +
  "hover:border-[var(--ui-border-strong)] [&>option]:bg-neutral-900";

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string | number;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative w-full min-w-0">
      <select value={value} onChange={onChange} className={SELECT_CLS}>
        {children}
      </select>
      <IoChevronDown
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[var(--ui-text-muted)]"
        aria-hidden
      />
    </div>
  );
}

type FilterSidebarProps = {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  isOpen?: boolean;
  onClose?: () => void;
  variant?: "sidebar" | "drawer";
  /** Desktop sidebar height — should match the profile card */
  panelHeightClass?: string;
};

const INTENT_OPTIONS = [
  { value: null, label: "Any" },
  { value: "join_me" as const, label: "Join me" },
  { value: "seeking_to_join" as const, label: "Seeking to join" },
];

function FilterPanel({
  filters,
  onChange,
  onClose,
  showClose,
  scrollable = false,
}: {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  onClose?: () => void;
  showClose?: boolean;
  scrollable?: boolean;
}) {
  const currentYear = new Date().getFullYear();
  const gradYears = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear - 6; y <= currentYear + 6; y++) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  const toggleSector = (sector: string) => {
    const next = filters.sectors.includes(sector)
      ? filters.sectors.filter((s) => s !== sector)
      : [...filters.sectors, sector];
    onChange({ ...filters, sectors: next });
  };

  const clearAll = () => onChange(EMPTY_DASHBOARD_FILTERS);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--ui-text)]">Filters</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters(filters) && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-[#bf5700] hover:underline cursor-pointer"
            >
              Clear all
            </button>
          )}
          {showClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-active)] hover:text-[var(--ui-text)] cursor-pointer"
              aria-label="Close filters"
            >
              <IoCloseOutline className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col gap-4 ${scrollable ? "overflow-y-auto" : "overflow-hidden"}`}
      >
        {/* School department */}
        <div className="flex min-w-0 flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
            School Department
          </label>
          <FilterSelect
            value={filters.college ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                college: e.target.value || null,
              })
            }
          >
            <option value="">All schools</option>
            {Object.keys(UT_SCHOOLS_AND_PROGRAMS).map((key) => (
              <option key={key} value={key}>
                {getSchoolLabel(key as UTCollege)}
              </option>
            ))}
          </FilterSelect>
        </div>

        {/* Industry / interest */}
        <div className="flex min-w-0 flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
            Industry / Interest
          </label>
          <div className="flex flex-wrap gap-1">
            {(
              Object.keys(SECTOR_INTEREST_LABELS) as UTSectorInterest[]
            ).map((sector) => {
              const selected = filters.sectors.includes(sector);
              return (
                <button
                  key={sector}
                  type="button"
                  onClick={() => toggleSector(sector)}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                    selected
                      ? "bg-[#bf5700] text-white"
                      : "bg-[var(--ui-surface-active)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]"
                  }`}
                >
                  {SECTOR_INTEREST_LABELS[sector]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Graduation year */}
        <div className="flex min-w-0 flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
            Graduation Year
          </label>
          <FilterSelect
            value={filters.gradYear ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                gradYear: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">Any year</option>
            {gradYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </FilterSelect>
        </div>

        {/* Intent */}
        <div className="flex min-w-0 flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
            Intent
          </label>
          <div className="flex flex-col gap-1.5">
            {INTENT_OPTIONS.map(({ value, label }) => (
              <label
                key={label}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-2 text-sm text-[var(--ui-text)] transition hover:border-[var(--ui-border-strong)] has-[:checked]:border-[var(--ui-text-muted)] has-[:checked]:bg-[var(--ui-surface-active)]"
              >
                <input
                  type="radio"
                  name="intent-filter"
                  checked={filters.intent === value}
                  onChange={() => onChange({ ...filters, intent: value })}
                  className="sr-only"
                />
                <span
                  className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                    filters.intent === value
                      ? "border-[#bf5700] bg-[#bf5700]"
                      : "border-[var(--ui-border-strong)] bg-transparent"
                  }`}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FilterSidebar({
  filters,
  onChange,
  isOpen = false,
  onClose,
  variant = "sidebar",
  panelHeightClass = "h-[calc(100vh-150px)] max-h-[calc(100vh-150px)]",
}: FilterSidebarProps) {
  useEffect(() => {
    if (variant !== "drawer" || !isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [variant, isOpen]);

  if (variant === "sidebar") {
    return (
      <aside
        className={`hidden w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 lg:flex ${panelHeightClass}`}
      >
        <FilterPanel filters={filters} onChange={onChange} scrollable={false} />
      </aside>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed left-0 top-0 z-50 flex h-full w-[85vw] max-w-sm flex-col border-r border-[var(--ui-border)] bg-[var(--ui-popover-bg,var(--org-bg,#ffffff))] p-4 shadow-xl"
          >
            <FilterPanel
              filters={filters}
              onChange={onChange}
              onClose={onClose}
              showClose
              scrollable
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function getFilterChipLabels(filters: DashboardFilters): {
  key: string;
  label: string;
  onRemove: () => DashboardFilters;
}[] {
  const chips: {
    key: string;
    label: string;
    onRemove: () => DashboardFilters;
  }[] = [];

  if (filters.college) {
    chips.push({
      key: `college-${filters.college}`,
      label: getSchoolLabel(filters.college as UTCollege),
      onRemove: () => ({ ...filters, college: null }),
    });
  }

  for (const sector of filters.sectors) {
    chips.push({
      key: `sector-${sector}`,
      label:
        SECTOR_INTEREST_LABELS[sector as UTSectorInterest] ?? sector,
      onRemove: () => ({
        ...filters,
        sectors: filters.sectors.filter((s) => s !== sector),
      }),
    });
  }

  if (filters.gradYear !== null) {
    chips.push({
      key: `grad-${filters.gradYear}`,
      label: `Class of ${filters.gradYear}`,
      onRemove: () => ({ ...filters, gradYear: null }),
    });
  }

  if (filters.intent === "join_me") {
    chips.push({
      key: "intent-join_me",
      label: "Join me",
      onRemove: () => ({ ...filters, intent: null }),
    });
  } else if (filters.intent === "seeking_to_join") {
    chips.push({
      key: "intent-seeking",
      label: "Seeking to join",
      onRemove: () => ({ ...filters, intent: null }),
    });
  }

  return chips;
}
