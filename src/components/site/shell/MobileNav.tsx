"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { BOOK_A_DEMO, CALENDLY_URL, NAV_ITEMS, WORDMARK } from "@/content/site/shell";
import CorporateMark from "../marks/CorporateMark";
import Button from "../ui/Button";
import { isActivePath } from "./NavLinks";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Burger + full-screen drawer below 1024px (spec §5.1, §9.1). The drawer
// traps focus, closes on Escape and on route change, and locks page scroll.
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    burgerRef.current?.focus();
  }, []);

  // Close whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const items = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // The drawer is hidden from 1024px up; don't leave the page locked.
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={burgerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="site-drawer"
        onClick={() => setOpen(true)}
        className="-mr-10 flex size-44 flex-none cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-ink lg:hidden"
      >
        <span className="flex w-20 flex-col gap-5" aria-hidden="true">
          <span className="block h-2 bg-current" />
          <span className="block h-2 bg-current" />
          <span className="block h-2 bg-current" />
        </span>
      </button>

      {open && (
        <div
          ref={drawerRef}
          id="site-drawer"
          data-drawer=""
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-40 flex flex-col bg-white pt-safe lg:hidden"
        >
          <div className="flex flex-none items-center justify-between gap-14 border-b border-rule px-20 py-header">
            <Link
              href="/"
              aria-label="Mamun home"
              onClick={() => setOpen(false)}
              className="flex min-h-44 items-center gap-11 text-ink type-wordmark"
            >
              <CorporateMark />
              <span aria-hidden="true">{WORDMARK}</span>
            </Link>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="-mr-10 flex size-44 cursor-pointer items-center justify-center border-0 bg-transparent p-0 font-sans text-ink type-close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <nav aria-label="Main" className="flex flex-1 flex-col overflow-y-auto px-20 pt-8 pb-20">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="flex min-h-52 items-center border-b border-rule-soft text-ink type-drawer"
              >
                {item.drawerLabel ?? item.label}
              </Link>
            ))}
            <Button
              href={CALENDLY_URL}
              variant="lime"
              size="drawer"
              position="drawer"
              className="mt-20"
            >
              {BOOK_A_DEMO}
            </Button>
          </nav>
        </div>
      )}
    </>
  );
}
