import Image from "next/image";
import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <footer className="flex w-full flex-col items-center justify-center gap-y-6 bg-(--charcoal-black) pt-12 pb-20 text-(--mist-white) sm:pt-16 sm:pb-30">
      <div className="flex flex-col items-center justify-center gap-y-4 sm:flex-row sm:gap-x-5 sm:gap-y-0">
        <Link
          href="/careers"
          className="translate-y text-sm hover:underline hover:underline-offset-4 sm:text-base"
        >
          Careers
        </Link>
        <Link
          href="/privacy-policy"
          className="translate-y text-sm hover:underline hover:underline-offset-4 sm:text-base"
        >
          Privacy Policy
        </Link>
        <Link
          href="/refund-policy"
          className="translate-y text-sm hover:underline hover:underline-offset-4 sm:text-base"
        >
          Refund Policy
        </Link>
        <Link
          href="/contact-us"
          className="translate-y text-sm hover:underline hover:underline-offset-4 sm:text-base"
        >
          Contact Us
        </Link>
        <a
          href="https://mamun-cofoundr.kit.com/d7eb029da2"
          target="_blank"
          rel="noopener noreferrer"
          className="translate-y text-sm hover:underline hover:underline-offset-4 sm:text-base"
        >
          Newsletter
        </a>
      </div>
      <Link href="/">
        <Image
          src="/img/mamun-transparent-logo.png"
          width={100}
          height={100}
          className="translate-y h-12 w-auto sm:h-16 md:h-20"
          alt="Mamun Logo. Circle with a line through it next to Mamun in all capital letters"
        />
      </Link>
    </footer>
  );
}

export default Footer;
