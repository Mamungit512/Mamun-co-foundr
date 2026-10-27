"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { UT_SCHOOLS_AND_PROGRAMS } from "@/features/school/data/utSchoolsAndMajors";
import { FOCUS_CLS } from "@/features/school/onboarding/quick/ui";

const OPTIONS = Object.entries(UT_SCHOOLS_AND_PROGRAMS).map(([value, school]) => ({
  value: value as UTCollege,
  label: school.label,
}));

export default function CollegeDropdown({
  value,
  onChange,
  labelId,
}: {
  value: UTCollege | undefined;
  onChange: (college: UTCollege) => void;
  labelId: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openMenu = () => {
    const index = OPTIONS.findIndex((o) => o.value === value);
    setActive(index >= 0 ? index : 0);
    setOpen(true);
  };

  const choose = (index: number) => {
    onChange(OPTIONS[index].value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, OPTIONS.length - 1));
    else if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(OPTIONS.length - 1);
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      if (e.key === "Escape") buttonRef.current?.focus();
      return;
    } else if (e.key.length === 1) {
      const match = OPTIONS.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (match >= 0) setActive(match);
      return;
    } else return;
    e.preventDefault();
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
        className={`flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl border bg-[var(--org-bg)] px-3.5 py-3 text-left text-sm font-medium transition-colors ${FOCUS_CLS} ${
          open
            ? "border-[var(--org-primary)] ring-3 ring-[var(--ui-surface-active)]"
            : "border-[var(--ui-border)] hover:border-[var(--ui-border-strong)]"
        }`}
      >
        <span
          className={`min-w-0 flex-1 truncate ${selected ? "text-[var(--ui-text)]" : "text-[var(--ui-text-muted)]"}`}
        >
          {selected?.label ?? "Choose your college"}
        </span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 shrink-0 text-[var(--org-primary)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelId}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={onListKeyDown}
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-[80] max-h-[248px] overflow-y-auto rounded-xl border border-[var(--ui-border)] bg-[var(--ui-popover-bg)] p-1.5 shadow-xl focus:outline-none"
        >
          {OPTIONS.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(index)}
                onClick={() => choose(index)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] ${
                  isSelected
                    ? "bg-[var(--org-primary)] font-semibold text-white"
                    : index === active
                      ? "bg-[var(--ui-surface-active)] text-[var(--ui-text)]"
                      : "text-[var(--ui-text-muted)]"
                }`}
              >
                <span
                  aria-hidden
                  className={`h-[7px] w-[7px] shrink-0 rounded-full ${isSelected ? "bg-white" : ""}`}
                />
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
