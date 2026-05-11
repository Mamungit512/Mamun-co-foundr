const STEPS = [
  {
    n: 1,
    title: "Build your profile",
    desc: "Skills, startup vision, and values that matter most to you as a builder.",
  },
  {
    n: 2,
    title: "Get matched",
    desc: "Engine surfaces verified McCombs founders with complementary skills and aligned values.",
  },
  {
    n: 3,
    title: "Start building",
    desc: "Connect, message, and find the person you want to build the next decade with.",
  },
];

export default function HowItWorks() {
  return (
    <section
      className="px-6 py-20"
      style={{ backgroundColor: "#d6d2c4" }}
    >
      <div className="mx-auto max-w-5xl">
        <h2
          className="mb-10 text-center text-2xl font-semibold sm:text-3xl"
          style={{ color: "#333f48" }}
        >
          Three steps to your ideal founding partner
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-lg border border-black/5 bg-white p-6"
            >
              <div
                className="mb-4 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: "#bf5700" }}
              >
                {s.n}
              </div>
              <div
                className="mb-1.5 text-sm font-semibold"
                style={{ color: "#333f48" }}
              >
                {s.title}
              </div>
              <div
                className="text-sm leading-relaxed"
                style={{ color: "#9cadb7" }}
              >
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
