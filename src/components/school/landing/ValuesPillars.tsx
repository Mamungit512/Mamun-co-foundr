const PILLARS = [
  {
    title: "Human centered",
    desc: "Matches built around people, not just skill sets or résumés.",
  },
  {
    title: "Ideas launched",
    desc: "Connecting bold thinkers ready to take the first step together.",
  },
  {
    title: "Individuals intersected",
    desc: "Diverse skills, backgrounds, and beliefs — stronger as a team.",
  },
  {
    title: "Future focused",
    desc: "Building for a world we can't yet imagine, starting now.",
  },
];

export default function ValuesPillars() {
  return (
    <section
      className="px-6 py-20"
      style={{ backgroundColor: "#333f48" }}
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-1.5 text-center text-2xl font-semibold text-white sm:text-3xl">
          Built on McCombs values
        </h2>
        <p
          className="mb-10 text-center text-sm"
          style={{ color: "#9cadb7" }}
        >
          Every match is filtered against four pillars that define who we are
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-lg border border-white/10 bg-white/5 p-5"
            >
              <div
                className="mb-3 h-2 w-2 rounded-full"
                style={{ backgroundColor: "#bf5700" }}
              />
              <div className="mb-1.5 text-sm font-semibold text-white">
                {p.title}
              </div>
              <div
                className="text-sm leading-relaxed"
                style={{ color: "#9cadb7" }}
              >
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
