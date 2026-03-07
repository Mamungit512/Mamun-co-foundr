"use client";

import {
  SignedIn,
  SignUpButton,
  SignedOut,
  UserButton,
  useClerk,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  FaPassport,
  FaTrash,
  FaHeart,
  FaBars,
  FaUsers,
  FaEnvelope,
  FaCreditCard,
  FaGift,
} from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";
import LikedProfilesModal from "@/components/LikedProfilesModal";
import { useLikedProfilesData } from "@/features/likes/useLikes";

function Header() {
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const [isLikedProfilesOpen, setIsLikedProfilesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: likedProfilesData } = useLikedProfilesData();
  const likedCount = likedProfilesData?.profiles?.length || 0;
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="section-padding relative flex items-center justify-between bg-(--charcoal-black) text-(--mist-white)">
      <Link href="/">
        <Image
          src="/img/mamun-transparent-logo.png"
          width={140}
          height={100}
          alt="Mamun Logo. Circle with a line through it next to Mamun in all capital letters"
          className="translate-y h-20 w-auto md:h-24 lg:h-32"
        />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden sm:block">
        <ul className="flex items-center justify-between gap-x-4 md:gap-x-6">
          <li className="translate-y text-sm font-semibold sm:text-base">
            <Link
              href="/cofoundr-matching"
              className="inline-block rounded-lg bg-gray-700 px-4 py-2 text-white transition hover:bg-gray-600"
            >
              Co-Foundr Matching
            </Link>
          </li>

          <li className="translate-y text-sm font-semibold sm:text-base">
            <Link
              href="/contact-us"
              className="underline decoration-gray-300 underline-offset-4"
            >
              Contact Support
            </Link>
          </li>
          <li className="translate-y text-sm font-semibold sm:text-base">
            <Link
              href="/pricing"
              className="underline decoration-gray-300 underline-offset-4"
            >
              Pricing
            </Link>
          </li>
          {/* <li className="translate-y text-sm font-semibold sm:text-base">
            <Link
              href="https://calendly.com/mcfm-mamuncofoundr/30min"
              target="_blank"
              className="underline underline-offset-4 transition hover:text-white"
            >
              Book a Demo
            </Link>
          </li>

          <li className="translate-y text-sm font-semibold sm:text-base">
            <Link
              href="https://luma.com/user/usr-eZsILDku7ToYtZZ"
              className="underline decoration-gray-300 underline-offset-4"
            >
              Events
            </Link>
          </li> */}
          <SignedIn>
            <li className="translate-y text-sm font-semibold underline underline-offset-4 sm:text-base">
              <Link href="/dashboard/referrals">Ambassador Only</Link>
            </li>
            <li>
              <button
                onClick={() => setIsLikedProfilesOpen(true)}
                className="group relative cursor-pointer rounded-full p-3 text-white transition-all duration-200 hover:bg-pink-500/20 hover:text-pink-400"
                title="View Liked Profiles"
              >
                <FaHeart className="h-5 w-5 transition-transform group-hover:scale-110" />
                {likedCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white">
                    {likedCount > 99 ? "99+" : likedCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push("/messages")}
                className="group relative cursor-pointer rounded-full p-3 text-lime-500 transition-all duration-200 hover:bg-blue-500/20 hover:text-blue-400"
                title="Messages"
              >
                <FaEnvelope className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>
            </li>
            <li>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: { width: "48px", height: "48px" },
                    userButtonPopoverActionButton__manageAccount: {
                      display: "none",
                    },
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Account and Billings"
                    labelIcon={<FaCreditCard />}
                    onClick={() =>
                      openUserProfile({
                        appearance: {
                          elements: {
                            profileSection__profile: { display: "none" },
                            profileSectionContent__profile: { display: "none" },
                            avatarImage: { display: "none" },
                            avatarImageActions: { display: "none" },
                          },
                        },
                      })
                    }
                  />
                  <UserButton.Link
                    label="Edit your profile"
                    href="/edit-profile"
                    labelIcon={<FaPassport />}
                  />
                  <UserButton.Action
                    label="Delete Account"
                    labelIcon={<FaTrash className="text-red-500" />}
                    onClick={async () => {
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
                            alert("Your account has been permanently deleted.");
                            // Sign out the user after successful deletion
                            signOut({ redirectUrl: "/" });
                          } else {
                            const errorData = await response.json();
                            alert(
                              `Error: ${errorData.error || "Failed to delete account"}`,
                            );
                          }
                        } catch (error) {
                          console.error("Error deleting account:", error);
                          alert(
                            "An error occurred while deleting your account. Please try again.",
                          );
                        }
                      }
                    }}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </li>
          </SignedIn>

          <SignedOut>
            <li>
              <div className="flex items-center gap-x-2">
                <SignUpButton>
                  <button className="cursor-pointer rounded-md bg-(--mist-white) px-4 py-2 font-semibold text-(--charcoal-black)">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </li>
          </SignedOut>
        </ul>
      </div>

      {/* Mobile Hamburger Menu */}
      <div className="flex items-center gap-3 sm:hidden">
        <SignedIn>
          <button
            onClick={() => setIsLikedProfilesOpen(true)}
            className="group relative cursor-pointer rounded-full p-2 text-white transition-all duration-200 hover:bg-pink-500/20 hover:text-pink-400"
            title="View Liked Profiles"
          >
            <FaHeart className="h-4 w-4 transition-transform group-hover:scale-110" />
            {likedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white">
                {likedCount > 99 ? "99+" : likedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push("/messages")}
            className="group relative cursor-pointer rounded-full p-2 text-white transition-all duration-200 hover:bg-blue-500/20 hover:text-blue-400"
            title="Messages"
          >
            <FaEnvelope className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
        </SignedIn>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="cursor-pointer rounded-lg p-2 text-white transition-all duration-200 hover:bg-gray-700/50"
          aria-label="Toggle mobile menu"
        >
          <motion.div
            animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isMobileMenuOpen ? (
              <FaTimes className="h-5 w-5" />
            ) : (
              <FaBars className="h-5 w-5" />
            )}
          </motion.div>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full right-4 z-50 mt-2 w-56 rounded-xl border border-gray-700/60 bg-(--charcoal-black) shadow-xl backdrop-blur-sm"
          >
            <div className="max-h-[75vh] overflow-y-auto overscroll-contain p-2">
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href="/cofoundr-matching"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700/50 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaUsers className="h-3.5 w-3.5 text-gray-400" />
                    Co-Foundr Matching
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact-us"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700/50 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg
                      className="h-3.5 w-3.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    target="_blank"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700/50 hover:text-white"
                  >
                    <svg
                      className="h-3.5 w-3.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Pricing
                  </Link>
                </li>

                <SignedIn>
                  <li>
                    <Link
                      href="/dashboard/referrals"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700/50 hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaGift className="h-3.5 w-3.5 text-gray-400" />
                      Ambassador Only
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openUserProfile({
                          appearance: {
                            elements: {
                              profileSection__profile: { display: "none" },
                              profileSectionContent__profile: {
                                display: "none",
                              },
                              avatarImage: { display: "none" },
                              avatarImageActions: { display: "none" },
                            },
                          },
                        });
                      }}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-gray-700/50 hover:text-white"
                    >
                      <FaCreditCard className="h-3.5 w-3.5 text-gray-400" />
                      Account and Billings
                    </button>
                  </li>
                  <li>
                    <Link
                      href="/edit-profile"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700/50 hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaPassport className="h-3.5 w-3.5 text-gray-400" />
                      Edit Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ redirectUrl: "/" });
                      }}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-gray-700/50 hover:text-white"
                    >
                      <svg
                        className="h-3.5 w-3.5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        const confirmed = confirm(
                          "Are you sure you want to delete your account? This action is PERMANENT and CANNOT be undone. All your data will be immediately deleted.",
                        );
                        if (confirmed) {
                          try {
                            const response = await fetch(
                              "/api/delete-profile",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                              },
                            );
                            if (response.ok) {
                              alert(
                                "Your account has been permanently deleted.",
                              );
                              signOut({ redirectUrl: "/" });
                            } else {
                              const errorData = await response.json();
                              alert(
                                `Error: ${errorData.error || "Failed to delete account"}`,
                              );
                            }
                          } catch (error) {
                            console.error("Error deleting account:", error);
                            alert(
                              "An error occurred while deleting your account. Please try again.",
                            );
                          }
                        }
                      }}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                    >
                      <FaTrash className="h-3.5 w-3.5" />
                      Delete Account
                    </button>
                  </li>
                </SignedIn>

                <SignedOut>
                  <li>
                    <SignUpButton>
                      <button
                        className="w-full rounded-lg bg-(--mist-white) px-3 py-2 text-sm font-semibold text-(--charcoal-black) transition-colors hover:bg-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </button>
                    </SignUpButton>
                  </li>
                </SignedOut>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liked Profiles Modal */}
      <LikedProfilesModal
        isOpen={isLikedProfilesOpen}
        onClose={() => setIsLikedProfilesOpen(false)}
      />
    </header>
  );
}

export default Header;
