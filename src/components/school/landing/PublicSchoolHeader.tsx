import Link from "next/link";

export default function PublicSchoolHeader() {
  return (
    <header
      className="flex items-center justify-between px-6 py-3"
      style={{ backgroundColor: "#bf5700" }}
    >
      <Link href="/" className="text-sm font-semibold text-white">
        Texas McCombs Co-Foundr
      </Link>

      <nav className="flex items-center gap-5">
        <a
          href="#departments"
          className="border-b border-white/40 pb-0.5 text-xs font-medium text-white"
        >
          Find a co-foundr
        </a>
        <a
          href="https://www.mccombs.utexas.edu/about/contact/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-white/75 hover:text-white"
        >
          Contact us
        </a>

        <Link
          href="/school/ut/sign-in"
          className="rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: "#ffffff", color: "#bf5700" }}
        >
          Sign in
        </Link>
      </nav>
    </header>
  );
}
