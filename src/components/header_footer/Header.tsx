"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { FaPassport } from "react-icons/fa6";

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
