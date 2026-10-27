import Link from "next/link";

import { BOOK_A_DEMO, CALENDLY_URL, WORDMARK } from "@/content/site/shell";
import CorporateMark from "../marks/CorporateMark";
import Button from "../ui/Button";
import MobileNav from "./MobileNav";
import NavLinks from "./NavLinks";

// Spec §5.1: sticky, white, 1px rule, no shadow / blur / shrink on scroll.
// Desktop nav from 1024px; a burger and full-screen drawer below that.
export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-14 border-b border-rule bg-white px-gutter py-header">
      <Link
        href="/"
        aria-label="Mamun home"
        className="flex min-h-44 items-center gap-11 text-ink type-wordmark lg:min-h-0"
      >
        <CorporateMark />
        <span aria-hidden="true">{WORDMARK}</span>
      </Link>

      <NavLinks />

      <div className="hidden items-center gap-18 lg:flex">
        <Button href={CALENDLY_URL} variant="lime" size="sm" position="header">
          {BOOK_A_DEMO}
        </Button>
      </div>

      <MobileNav />
    </header>
  );
}
