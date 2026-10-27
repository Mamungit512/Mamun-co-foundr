import { BOOK_A_DEMO, CALENDLY_URL } from "@/content/site/shell";
import { MATCHING_HERO as H } from "@/content/site/matching";
import Button from "../ui/Button";
import Eyebrow from "../ui/Eyebrow";

// /matching hero — left-aligned, the only hero with a secondary button
// ("See it running" → /platform, spec §11.1).
export default function MatchingHero() {
  return (
    <section
      aria-labelledby="matching-page-title"
      className="box-content flex max-w-900 flex-col gap-22 px-gutter pt-fluid-80 pb-60"
    >
      <Eyebrow tone="live">{H.eyebrow}</Eyebrow>
      <h1 id="matching-page-title" className="text-ink type-display-2">
        {H.title}
      </h1>
      <p className="max-w-640 text-text-body type-body-lg">{H.subline}</p>
      <div className="flex gap-12 pt-6">
        <Button href={CALENDLY_URL} position="hero">
          {BOOK_A_DEMO}
        </Button>
        <Button href={H.secondary.href} variant="secondary">
          {H.secondary.label}
        </Button>
      </div>
    </section>
  );
}
