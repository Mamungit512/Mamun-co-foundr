import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="px-6 py-24 text-center"
      style={{ backgroundColor: "#bf5700" }}
    >
      <h1 className="mx-auto mb-3 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
        Make it here.
        <br />
        <span className="text-white/60">Find your founding team.</span>
      </h1>
      <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
        The McCombs co-foundr matching platform connects value-aligned students,
        alumni, and faculty ready to build something that changes the world.
      </p>
      <Link
        href="/school/ut/sign-up"
        className="inline-block rounded-md px-6 py-3 text-sm font-semibold"
        style={{ backgroundColor: "#ffffff", color: "#bf5700" }}
      >
        Find your co-foundr →
      </Link>
    </section>
  );
}
