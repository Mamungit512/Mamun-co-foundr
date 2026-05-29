import Link from "next/link";

export default function PublicSchoolHeader() {
  return (
    <header
      className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 px-4 sm:px-6 py-3 sm:py-4"
      style={{ backgroundColor: "#bf5700" }}
    >
      <Link href="/" className="text-xs sm:text-sm font-semibold text-white text-center sm:text-left">
        University of Texas at Austin Co-Foundr
      </Link>

      <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
        <a
          href="#departments"
          className="border-b border-white/40 pb-0.5 text-xs sm:text-sm font-medium text-white whitespace-nowrap"
        >
          Find a co-foundr
        </a>
        <Link
          href="/school/ut/contact-us"
          className="text-xs sm:text-sm font-medium text-white/75 hover:text-white whitespace-nowrap"
        >
          Contact us
        </Link>

        <Link
          href="/school/ut/sign-in"
          className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold whitespace-nowrap"
          style={{ backgroundColor: "#ffffff", color: "#bf5700" }}
        >
          Sign in
        </Link>
      </nav>
    </header>
  );
}
