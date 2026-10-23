import { PIVOT } from "@/content/site/home";
import Eyebrow from "../ui/Eyebrow";
import HairlineGrid from "../ui/HairlineGrid";

type Era = { label: string; title: string; points: string[] };

function EraCard({ era, tone }: { era: Era; tone: "before" | "now" }) {
  const now = tone === "now";
  return (
    <div className={`flex flex-col gap-16 px-32 py-30 ${now ? "bg-ink" : "bg-white"}`}>
      <div className="flex items-center gap-10">
        <span className={`type-label ${now ? "text-lime" : "text-text-caption"}`}>{era.label}</span>
        <span aria-hidden="true" className={`block h-px flex-1 ${now ? "bg-dark-rule" : "bg-rule"}`} />
      </div>
      <h3 className={`type-card-lg ${now ? "text-white" : "text-text-caption"}`}>{era.title}</h3>
      <ul className="m-0 flex list-none flex-col gap-9 p-0">
        {era.points.map((point) => (
          <li key={point} className={`type-body-sm ${now ? "text-dk-strong" : "text-text-caption"}`}>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 03 The pivot — before / after, two facing cards in a hairline grid. The
// "before" card is muted with #6B6B62, not the prototype's #A8A89E / #8A8A80,
// which fail AA contrast (spec §14).
export default function Pivot() {
  return (
    <section
      aria-labelledby="pivot-title"
      className="flex flex-col gap-36 border-b border-rule bg-bone px-gutter py-fluid-80"
    >
      <div className="grid grid-cols-1 items-start gap-56 md:grid-cols-2 lg:grid-cols-lead">
        <div className="flex flex-col gap-14">
          <Eyebrow>{PIVOT.eyebrow}</Eyebrow>
          <h2 id="pivot-title" className="text-ink type-head-3">
            {PIVOT.title}
          </h2>
        </div>
        <div className="flex flex-col gap-14 pt-4">
          {PIVOT.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="text-text-body type-lede">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <HairlineGrid columns={2}>
        <EraCard era={PIVOT.before} tone="before" />
        <EraCard era={PIVOT.now} tone="now" />
      </HairlineGrid>
    </section>
  );
}
