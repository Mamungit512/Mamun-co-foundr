"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { FaHeart } from "react-icons/fa6";
import clsx from "clsx";
import { useMutualLikes } from "@/features/likes/useLikes";
import type { OrgConfig } from "@/orgs/types";

type SchoolHeaderProps = {
  slug: string;
  schoolName: string;
  config: OrgConfig;
};

export default function SchoolHeader({ slug, schoolName, config }: SchoolHeaderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { data: mutualLikes } = useMutualLikes();

  useEffect(() => setMounted(true), []);

  const savedMatchesCount = mutualLikes?.matches?.length ?? 0;

  const navItems = [
    {
      href: `/school/${slug}/dashboard`,
      label: "Find a co-foundr",
    },
    {
      href: "https://www.mccombs.utexas.edu/about/contact/",
      label: "Contact us",
      external: true,
    },
  ];

  const headerText = config.branding.wordmark ? `${config.branding.wordmark} McCombs Co-Foundr` : schoolName;

  return (
    <header
      className="flex items-center justify-between px-6 py-4"
      style={{ backgroundColor: config.branding.primaryColor, color: "#ffffff" }}
    >
      <Link
        href={`/school/${slug}`}
        className="text-base font-semibold tracking-tight text-white"
      >
        {headerText}
      </Link>

      <nav className="hidden flex-1 items-center justify-end gap-8 md:flex">
        {navItems.map(({ href, label, external }) => {
          const classes = clsx(
            "text-sm font-medium transition-opacity border-b-2",
            !external && pathname.startsWith(href)
              ? "opacity-100 border-white"
              : "opacity-70 hover:opacity-90 border-transparent",
          );
          return external ? (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={classes}
            >
              {label}
            </a>
          ) : (
            <Link key={href} href={href} className={classes}>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-8 flex items-center gap-6">
        <Link
          href={`/school/${slug}/matches`}
          className="relative flex items-center justify-center transition-opacity hover:opacity-80"
        >
          <FaHeart className="h-5 w-5 text-white" />
          {savedMatchesCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {savedMatchesCount > 99 ? "99+" : savedMatchesCount}
            </span>
          )}
        </Link>

        {mounted && <UserButton />}
      </div>
    </header>
  );
}
