import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

function Header() {
  return (
    <header className="section-padding flex items-center justify-between bg-(--charcoal-black) text-(--mist-white)">
      <a href="#">
        <Image
          src="/img/Mamun Logo.png"
          width={130}
          height={100}
          alt="Mamun Logo. Circle with a line through it next to Mamun in all capital letters"
        />
      </a>

      <div>
        <ul className="flex items-center justify-between gap-x-6">
          <li className="translate-y font-semibold">
            <a href="#">Juma&apos;ah</a>
          </li>
          <li className="translate-y font-semibold">
            <a href="#">Co-Foundr Matching</a>
          </li>
          <li className="translate-y font-semibold">
            <a href="#">Startup Jobs</a>
          </li>
          <li className="translate-y font-semibold">
            <a href="#">Mission</a>
          </li>

          <SignedIn>
            <li>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: { width: "48px", height: "48px" },
                  },
                }}
              />
            </li>
          </SignedIn>

          <SignedOut>
            <li>
              <button className="flex cursor-pointer items-center gap-x-2">
                <SignInButton>
                  <button className="rounded-md bg-(--mist-white) px-4 py-2 font-semibold text-(--charcoal-black)">
                    Login
                  </button>
                </SignInButton>
              </button>
            </li>
          </SignedOut>
        </ul>
      </div>
    </header>
  );
}

export default Header;
