"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { FaPassport, FaTrash } from "react-icons/fa6";

function Header() {
  return (
    <header className="section-padding flex items-center justify-between bg-(--charcoal-black) text-(--mist-white)">
      <Link href="/">
        <Image
          src="/img/mamun-transparent-logo.png"
          width={140}
          height={100}
          alt="Mamun Logo. Circle with a line through it next to Mamun in all capital letters"
          className="translate-y"
        />
      </Link>

      <div>
        <ul className="flex items-center justify-between gap-x-6">
          <li className="translate-y font-semibold">
            <Link href="/cofoundr-matching">Co-Foundr Matching</Link>
          </li>

          <li className="translate-y font-semibold">
            <Link href="/contact-us">Contact Us</Link>
          </li>

          <SignedIn>
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
                        "Are you sure you want to delete your account? It will be permanently removed after 3 months.",
                      );
                      if (confirmed) {
                        try {
                          const response = await fetch("/api/delete-profile", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                          });

                          if (response.ok) {
                            alert("Your account has been marked for deletion.");
                            // Optionally redirect to home page or sign out
                            window.location.href = "/";
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
    </header>
  );
}

export default Header;
