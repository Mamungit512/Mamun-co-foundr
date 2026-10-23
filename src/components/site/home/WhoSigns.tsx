import { BOOK_A_DEMO, CALENDLY_URL } from "@/content/site/shell";
import { WHO_SIGNS } from "@/content/site/home";
import Button from "../ui/Button";

// 08 Who signs — the buyer card and the page's closing Book a demo. The
// homepage has no CTA band (spec §6).
export default function WhoSigns() {
  return (
    <section
      aria-labelledby="who-signs-title"
      className="flex flex-col gap-30 border-b border-rule px-gutter py-fluid-80"
    >
      <h2 id="who-signs-title" className="text-ink type-head-6-loose">
        {WHO_SIGNS.title}
      </h2>
      <div data-reveal="" className="grid grid-cols-1 gap-24 md:grid-cols-2 lg:grid-cols-who">
        {WHO_SIGNS.cards.map((card) => (
          <div
            key={card.role}
            data-card=""
            className="flex flex-col gap-12 rounded-card border border-rule-card p-32"
          >
            <p className="text-text-eyebrow type-label-md">{card.role}</p>
            <h3 className="text-ink type-card">{card.title}</h3>
            <p className="text-text-muted type-card-body">{card.body}</p>
          </div>
        ))}
      </div>
      <Button href={CALENDLY_URL} size="lg" position="who-signs" className="mt-12 self-start">
        {BOOK_A_DEMO}
      </Button>
    </section>
  );
}
