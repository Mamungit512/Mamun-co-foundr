import Link from "next/link";

export default function CtaBand() {
  return (
    <section
      className="px-6 py-20 text-center"
      style={{ backgroundColor: "#bf5700" }}
    >
      <div
        className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em]"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        Texas McCombs School of Business
      </div>
      <h2 className="mb-3 text-3xl font-semibold text-white sm:text-4xl">
        Make it here.
      </h2>
      <p className="mx-auto mb-7 max-w-md text-sm leading-relaxed text-white/70">
        Join the McCombs co-foundr community — verified, value-aligned, and
        ready to build something that changes the world.
      </p>
      <Link
        href="/school/ut/sign-up"
        className="mb-4 inline-block rounded-md px-7 py-3 text-sm font-semibold"
        style={{ backgroundColor: "#ffffff", color: "#bf5700" }}
      >
        Create your profile
      </Link>
      <div className="text-xs text-white/40">
        Exclusively for McCombs students, alumni, and faculty
      </div>
    </section>
  );
}
