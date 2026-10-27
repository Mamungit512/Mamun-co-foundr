import { FIRST_CHECK as F } from "@/content/site/matching";

// "The first check shouldn't require a warm intro" — bone ground, .9fr / 1.1fr.
export default function FirstCheck() {
  return (
    <section
      aria-labelledby="first-check-title"
      className="grid grid-cols-1 gap-64 border-b border-rule bg-bone px-gutter py-fluid-84 md:grid-cols-2 lg:grid-cols-split"
    >
      <div className="flex flex-col gap-16">
        <h2 id="first-check-title" className="text-ink type-head-5">
          {F.title}
        </h2>
        <p className="text-text-muted type-body-16">{F.body}</p>
      </div>
      <div data-reveal="" className="grid grid-cols-1 gap-24 md:grid-cols-2">
        {F.cards.map((card) => (
          <div
            key={card.label}
            data-card=""
            className="flex flex-col gap-10 rounded-card border border-rule-card bg-white p-28"
          >
            <h3 className={`type-label-md ${card.live ? "text-lime-deep" : "text-text-eyebrow"}`}>
              {card.label}
            </h3>
            <p className="text-text-strong type-card-text">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
