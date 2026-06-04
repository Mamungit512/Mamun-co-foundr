"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useClerk } from "@clerk/nextjs";
import { FaHeart, FaBars, FaUserPen, FaTrash } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import clsx from "clsx";
import { useLikedProfilesData } from "@/features/likes/useLikes";
import type { OrgConfig } from "@/features/school/registry/types";

type SchoolHeaderProps = {
  slug: string;
  schoolName: string;
  config: OrgConfig;
  isAdmin: boolean;
};

export default function SchoolHeader({ slug, schoolName, config, isAdmin }: SchoolHeaderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { data: likedProfilesData } = useLikedProfilesData();
  const { signOut } = useClerk();

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account? This action is PERMANENT and CANNOT be undone. All your data will be immediately deleted.",
    );
    if (confirmed) {
      try {
        const response = await fetch("/api/delete-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.clerkDeleted === false) {
            alert(
              "Your data was deleted, but we couldn't fully remove your account. Please contact support.",
            );
          } else {
            alert("Your account has been permanently deleted.");
          }
          signOut({ redirectUrl: `/school/${slug}` });
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || "Failed to delete account"}`);
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        alert(
          "An error occurred while deleting your account. Please try again.",
        );
      }
    }
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  const savedMatchesCount = likedProfilesData?.profiles?.length ?? 0;

  const navItems = [
    {
      href: `/school/${slug}/dashboard`,
      label: "Find a co-foundr",
    },
    {
      href: `/school/${slug}/contact-us`,
      label: "Contact us",
    },
    {
      href: "/privacy-policy",
      label: "Privacy Policy",
    },
    ...(isAdmin
      ? [{ href: `/school/${slug}/admin`, label: "Admin" }]
      : []),
  ];

  const headerText = config.branding.wordmark ? `${config.branding.wordmark} Co-Foundr` : schoolName;

  return (
    <header
      className="relative flex items-center justify-between px-6 py-4"
      style={{ backgroundColor: config.branding.primaryColor, color: "#ffffff" }}
    >
      <Link
        href={`/school/${slug}`}
        className="text-base font-semibold tracking-tight text-white"
      >
        {headerText}
      </Link>

      {/* Desktop nav */}
      <nav className="hidden flex-1 items-center justify-end gap-8 md:flex">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "text-sm font-medium transition-opacity border-b-2",
              pathname.startsWith(href)
                ? "opacity-100 border-white"
                : "opacity-70 hover:opacity-90 border-transparent",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="ml-4 flex items-center gap-4 md:ml-8 md:gap-6">
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

        {mounted && (
          <UserButton
            userProfileProps={{
              appearance: {
                elements: {
                  profileSection__danger: { display: "none" },
                },
              },
            }}
            afterSignOutUrl={`/school/${slug}`}
          >
            <UserButton.MenuItems>
              <UserButton.Link
                label="Edit profile"
                labelIcon={<FaUserPen className="h-3.5 w-3.5" />}
                href={`/school/${slug}/profile`}
              />
              <UserButton.Action
                label="Delete Account"
                labelIcon={<FaTrash className="h-3.5 w-3.5 text-red-500" />}
                onClick={handleDeleteAccount}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="cursor-pointer rounded-lg p-1.5 text-white transition-opacity hover:opacity-80 md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-full right-4 z-50 mt-1 w-48 rounded-xl border border-white/20 shadow-xl md:hidden"
          style={{ backgroundColor: config.branding.primaryColor }}
        >
          <ul className="p-2 space-y-0.5">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
