import { BOOK_A_DEMO, CALENDLY_URL } from "@/content/site/shell";
import { CREDIBILITY, HERO } from "@/content/site/home";
import CorporateMark from "../marks/CorporateMark";
import Button from "../ui/Button";

// 01 Hero — centred, corporate mark under the h1 — and 02 the credibility
// band, which sits flush under it and breaks the gutter. The hero never
// animates in (spec §8.1).
export default function Hero() {
  return (
    <section
      aria-labelledby="home-title"
      className="flex flex-col items-center gap-52 px-gutter pt-fluid-96 text-center"
    >
      <div className="flex max-w-820 flex-col items-center gap-22">
        <h1 id="home-title" className="text-ink type-display-1">
          {HERO.title}
        </h1>
        <CorporateMark size="hero" className="my-2 text-ink" />
        <p className="max-w-620 text-text-body type-body-lg">{HERO.subline}</p>
        <div className="flex gap-12 pt-4">
          <Button href={CALENDLY_URL} position="hero">
            {BOOK_A_DEMO}
          </Button>
        </div>
      </div>

      <div className="-mx-gutter self-stretch overflow-hidden border-y border-rule bg-bone-light">
        <p className="block px-16 pt-14 text-center md:flex md:items-center md:justify-center md:gap-10">
          <span
            aria-hidden="true"
            className="mr-8 mb-2 inline-block size-6 flex-none rounded-full bg-lime-deep align-middle md:m-0 md:block"
          />
          <span className="text-center text-text-eyebrow type-cred-status">
            {CREDIBILITY.status}
          </span>
        </p>
        <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-y-8 px-16 pt-18 pb-20">
          <li className="flex items-center gap-12 px-cred text-center font-bold text-ink type-cred">
            <span aria-hidden="true" className="block size-5 rounded-full bg-lime shadow-ut-dot" />
            {CREDIBILITY.named}
          </li>
          {CREDIBILITY.counts.map((count) => (
            <li key={count} className="contents">
              <span aria-hidden="true" className="hidden h-20 w-px flex-none bg-rule-card md:block" />
              <span className="px-cred text-center font-semibold text-text-caption type-cred">
                {count}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
