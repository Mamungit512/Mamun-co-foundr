import Button from "./Button";

// CTA band (spec §6): full-bleed, headline left, one button right, wrapping
// with a 48px gap when there is no room. Lime by default; dark and bone are
// the alternates. At most one per page, and never on the homepage.

type Tone = "lime" | "dark" | "bone";

const TONE: Record<Tone, { band: string; heading: string; button: "primary" | "lime" }> = {
  lime: { band: "bg-lime", heading: "text-ink", button: "primary" },
  dark: { band: "bg-dark", heading: "text-white", button: "lime" },
  bone: { band: "bg-bone", heading: "text-ink", button: "primary" },
};

type Props = {
  id: string;
  heading: React.ReactNode;
  cta: { href: string; label: string };
  tone?: Tone;
  /** Heading measure as drawn on each page. */
  measure?: "600" | "620";
};

export default function CtaBand({ id, heading, cta, tone = "lime", measure = "600" }: Props) {
  const t = TONE[tone];
  return (
    <section
      aria-labelledby={id}
      className={`flex flex-wrap items-center justify-between gap-48 px-gutter py-fluid-76 ${t.band}`}
    >
      <h2 id={id} className={`${measure === "620" ? "max-w-620" : "max-w-600"} type-cta ${t.heading}`}>
        {heading}
      </h2>
      <Button href={cta.href} variant={t.button} size="lg" position="band">
        {cta.label}
      </Button>
    </section>
  );
}
