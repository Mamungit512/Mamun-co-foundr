import Image from "next/image";
import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <footer className="w-full bg-(--charcoal-black) text-(--mist-white)">
      <div className="mx-auto max-w-5xl px-8 pt-14 pb-8">
        {/* Top section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10 pb-12">
          {/* Left: Logo + tagline */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/img/mamun-transparent-logo.png"
                width={40}
                height={40}
                className="h-10 w-auto"
                alt="Mamun Logo"
              />
              <span className="text-lg font-semibold tracking-widest uppercase text-(--mist-white)">
                Mamun
              </span>
            </Link>
            <p className="text-base font-bold text-[#D0FE1D]">
              Inspired by Islamic Ethics
            </p>
          </div>

          {/* Right: Link columns */}
          <div className="flex gap-12">
            {/* Company column */}
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold tracking-widest uppercase text-(--mist-white) opacity-50">
                Company
              </p>
              <Link
                href="/careers"
                className="text-base text-(--mist-white) opacity-80 hover:opacity-100 hover:underline hover:underline-offset-4 transition-opacity"
              >
                Careers
              </Link>
              <Link
                href="/privacy-policy"
                className="text-base text-(--mist-white) opacity-80 hover:opacity-100 hover:underline hover:underline-offset-4 transition-opacity"
              >
                Privacy Policy
              </Link>
            </div>

            {/* Support column */}
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold tracking-widest uppercase text-(--mist-white) opacity-50">
                Support
              </p>
              <Link
                href="/refund-policy"
                className="text-base text-(--mist-white) opacity-80 hover:opacity-100 hover:underline hover:underline-offset-4 transition-opacity"
              >
                Refund Policy
              </Link>
              <Link
                href="/contact-us"
                className="text-base text-(--mist-white) opacity-80 hover:opacity-100 hover:underline hover:underline-offset-4 transition-opacity"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-white/10" />

        {/* Bottom: copyright + LinkedIn */}
        <div className="flex items-center justify-between pt-6">
          <p className="text-base text-(--mist-white) opacity-40">
            © 2026 Mamun. All rights reserved.
          </p>
          <a
            href="https://www.linkedin.com/company/mamunic/?viewAsMember=true"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex items-center justify-center w-8 h-8 rounded border border-white/20 text-(--mist-white) opacity-60 hover:opacity-100 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;