"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useClerk,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaPassport, FaTrash, FaHeart } from "react-icons/fa6";
import LikedProfilesModal from "@/components/LikedProfilesModal";
import { useLikedProfilesData } from "@/features/likes/useLikes";

function Header() {
  const { signOut } = useClerk();
  const [isLikedProfilesOpen, setIsLikedProfilesOpen] = useState(false);
  const { data: likedProfilesData } = useLikedProfilesData();
  const likedCount = likedProfilesData?.profiles?.length || 0;

  return (
    <header className="section-padding flex items-center justify-between bg-(--charcoal-black) text-(--mist-white)">
      <Link href="/">
        <Image
          src="/img/mamun-transparent-logo.png"
          width={140}
          height={100}
          alt="Mamun Logo. Circle with a line through it next to Mamun in all capital letters"
          className="translate-y h-12 w-auto sm:h-16 md:h-20"
        />
      </Link>

      <div>
        <ul className="flex items-center justify-between gap-x-3 sm:gap-x-4 md:gap-x-6">
          <li className="translate-y text-sm font-semibold sm:text-base">
            <Link href="/cofoundr-matching">Co-Foundr Matching</Link>
          </li>

          <li className="translate-y text-sm font-semibold sm:text-base">
            <Link href="/contact-us">Contact Us</Link>
          </li>

          <SignedIn>
            <li>
              <button
                onClick={() => setIsLikedProfilesOpen(true)}
                className="group relative cursor-pointer rounded-full p-2 text-gray-300 transition-all duration-200 hover:bg-pink-500/20 hover:text-pink-400 sm:p-3"
                title="View Liked Profiles"
              >
                <FaHeart className="h-4 w-4 transition-transform group-hover:scale-110 sm:h-5 sm:w-5" />
                {likedCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white sm:h-5 sm:w-5">
                    {likedCount > 99 ? "99+" : likedCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: { width: "48px", height: "48px" },
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Edit your ummatic passport"
                    href="/edit-profile"
                    labelIcon={<FaPassport />}
                  />
                  <UserButton.Action
                    label="Delete Account"
                    labelIcon={<FaTrash />}
                    onClick={async () => {
                      const confirmed = confirm(
                        "Are you sure you want to delete your account? It will be permanently removed after 3 months. Reactivate your account by logging back in before the permanent deletion date.",
                      );
                      if (confirmed) {
                        try {
                          const response = await fetch("/api/delete-profile", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                          });

                          if (response.ok) {
                            alert(
                              "Your account has been marked for deletion. You will now be signed out.",
                            );
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
                <SignInButton>
                  <button className="cursor-pointer rounded-md bg-(--mist-white) px-4 py-2 font-semibold text-(--charcoal-black)">
                    Login
                  </button>
                </SignInButton>
              </div>
            </li>
          </SignedOut>
        </ul>
      </div>

      {/* Liked Profiles Modal */}
      <LikedProfilesModal
        isOpen={isLikedProfilesOpen}
        onClose={() => setIsLikedProfilesOpen(false)}
      />
    </header>
  );
}

export default Header;
