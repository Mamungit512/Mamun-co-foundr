import { CALENDLY_URL } from "@/content/site/shell";
import { ROADMAP } from "@/content/site/home";
import ArrowLink from "../ui/ArrowLink";
import Eyebrow from "../ui/Eyebrow";

// 07 Roadmap band — the one mention of products in development. It names
// no products and has no bars (spec "Start here", Oct 16 2026).
export default function RoadmapBand() {
  return (
    <section aria-labelledby="roadmap-title" className="px-gutter pt-fluid-80">
      <div className="flex flex-wrap items-baseline justify-between gap-x-40 gap-y-12 border-y border-rule-card py-roadmap">
        <div className="flex max-w-640 flex-col gap-10">
          <Eyebrow>{ROADMAP.eyebrow}</Eyebrow>
          <h2 id="roadmap-title" className="text-ink type-roadmap-title">
            {ROADMAP.title}
          </h2>
          <p className="text-text-muted type-roadmap-body">{ROADMAP.body}</p>
        </div>
        <ArrowLink href={CALENDLY_URL} selfStart={false} className="whitespace-nowrap">
          {ROADMAP.link}
        </ArrowLink>
      </div>
    </section>
  );
}
