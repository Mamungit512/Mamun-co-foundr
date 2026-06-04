"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { IoCloseOutline, IoChevronDown } from "react-icons/io5";
import {
  UT_SCHOOLS_AND_PROGRAMS,
  SECTOR_INTEREST_LABELS,
  getSchoolLabel,
} from "@/features/school/data/utSchoolsAndMajors";
import {
  type DashboardFilters,
  EMPTY_DASHBOARD_FILTERS,
  hasActiveFilters,
} from "@/features/school/data/dashboardFilters";

type SelectOption = { value: string; label: string };

function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
}: {
  value: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === String(value));

  useEffect(() => { setMounted(true); }, []);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="w-full min-w-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="box-border flex w-full min-w-0 items-center justify-between rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] py-2.5 pl-4 pr-3 text-left text-sm transition-all duration-200 hover:border-[var(--ui-border-strong)] focus:border-[var(--ui-border-strong)] focus:ring-2 focus:ring-[var(--ui-border)] focus:outline-none"
      >
        <span className={selected ? "text-[var(--ui-text)]" : "text-[var(--ui-text-muted)]"}>
          {selected ? selected.label : placeholder}
        </span>
        <IoChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--ui-text-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.ul
              ref={listRef}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              role="listbox"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
              className="fixed z-[9999] max-h-52 overflow-y-auto rounded-xl border border-[#BF5700]/30 bg-[#fff6f0] shadow-lg"
            >
              <li
                role="option"
                aria-selected={!selected}
                onClick={() => { onChange(""); setOpen(false); }}
                className={`cursor-pointer px-4 py-2.5 text-sm transition hover:bg-[#BF5700]/10 ${!selected ? "font-medium text-[#BF5700]" : "text-[#3d1a00]/50"}`}
              >
                {placeholder}
              </li>
              {options.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === String(value)}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`cursor-pointer px-4 py-2.5 text-sm transition hover:bg-[#BF5700]/10 ${opt.value === String(value) ? "font-medium text-[#BF5700]" : "text-[#3d1a00]"}`}
                >
                  {opt.value === String(value) && <span className="mr-1.5">✓</span>}
                  {opt.label}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body
      )}
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
            onChange={(val) => onChange({ ...filters, college: val || null })}
            options={Object.keys(UT_SCHOOLS_AND_PROGRAMS).map((key) => ({
              value: key,
              label: getSchoolLabel(key as UTCollege),
            }))}
            placeholder="All schools"
          />
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
            onChange={(val) => onChange({ ...filters, gradYear: val ? Number(val) : null })}
            options={gradYears.map((year) => ({ value: String(year), label: String(year) }))}
            placeholder="Any year"
          />
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
  panelHeightClass = "",
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
        <FilterPanel filters={filters} onChange={onChange} scrollable={true} />
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
            className="fixed left-0 top-0 z-50 flex h-full w-[85vw] max-w-sm flex-col overflow-x-hidden border-r border-[var(--ui-border)] bg-[var(--ui-popover-bg,var(--org-bg,#ffffff))] p-4 shadow-xl"
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

export type FilterChipLabel = {
  key: string;
  /** Key used by search inferred-filter dismiss (e.g. `sector:fintech`, `college`) */
  dismissKey: string;
  label: string;
  onRemove: () => DashboardFilters;
};

export function getFilterChipLabels(filters: DashboardFilters): FilterChipLabel[] {
  const chips: FilterChipLabel[] = [];

  if (filters.college) {
    chips.push({
      key: `college-${filters.college}`,
      dismissKey: "college",
      label: getSchoolLabel(filters.college as UTCollege),
      onRemove: () => ({ ...filters, college: null }),
    });
  }

  for (const sector of filters.sectors) {
    chips.push({
      key: `sector-${sector}`,
      dismissKey: `sector:${sector}`,
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
      dismissKey: "gradYear",
      label: `Class of ${filters.gradYear}`,
      onRemove: () => ({ ...filters, gradYear: null }),
    });
  }

  if (filters.intent === "join_me") {
    chips.push({
      key: "intent-join_me",
      dismissKey: "intent",
      label: "Join me",
      onRemove: () => ({ ...filters, intent: null }),
    });
  } else if (filters.intent === "seeking_to_join") {
    chips.push({
      key: "intent-seeking",
      dismissKey: "intent",
      label: "Seeking to join",
      onRemove: () => ({ ...filters, intent: null }),
    });
  }

  return chips;
}
