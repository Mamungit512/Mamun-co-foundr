"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/content/site/shell";
import NodeMark from "../marks/NodeMark";

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Desktop nav bar (≥1024px). Active: 600 ink with a 2px lime rule;
// inactive: 500 strong grey (spec §5.1).
export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav data-nav="" aria-label="Main" className="hidden items-center gap-nav type-nav lg:flex">
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-8 ${
              active
                ? "border-b-2 border-lime pb-3 font-semibold text-ink"
                : "font-medium text-text-strong"
            }`}
          >
            {item.nodeMark && <NodeMark size={18} />}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
