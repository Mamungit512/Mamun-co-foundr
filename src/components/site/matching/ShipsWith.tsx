import { SHIPS_WITH as S } from "@/content/site/matching";
import HairlineGrid from "../ui/HairlineGrid";

// "What ships with every contract" — eight cells in a 4-column hairline grid.
export default function ShipsWith() {
  return (
    <section
      aria-labelledby="ships-with-title"
      className="flex flex-col gap-36 border-b border-rule px-gutter py-fluid-84"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-40">
        <h2 id="ships-with-title" className="text-ink type-head-5-loose">
          {S.title}
        </h2>
        <p className="text-text-caption type-note">{S.aside}</p>
      </div>
      <HairlineGrid columns={4}>
        {S.items.map((item) => (
          <div key={item.title} className="flex flex-col gap-8 bg-white p-26">
            <h3 className="text-ink type-cell-title">{item.title}</h3>
            <p className="text-text-caption type-cell-body">{item.body}</p>
          </div>
        ))}
      </HairlineGrid>
    </section>
  );
}
