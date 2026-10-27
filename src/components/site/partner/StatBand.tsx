import { PARTNER_STATS } from "@/content/site/partner";

// Per-cell padding. Phones: no side padding. Tablet 2×2: padding on the
// inner side of each column. Desktop, as drawn: the outer cells sit flush
// with the gutter.
const CELL = [
  "md:pr-28 lg:pr-28",
  "md:pl-28 lg:px-28",
  "md:pr-28 lg:px-28",
  "md:pl-28 lg:pl-28",
];

// /partner stat band — full-width dark, four columns split by 1px rules.
// Phones stack one column and tablets go 2×2, with the dividers becoming a
// 1px grid gap (spec §9).
export default function StatBand() {
  return (
    <section aria-label="Where Mamun is today" className="bg-dark px-gutter py-fluid-64">
      <div className="grid grid-cols-1 gap-px bg-dark-rule md:grid-cols-2 lg:grid-cols-4 lg:bg-transparent">
        {PARTNER_STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col gap-7 bg-dark py-20 lg:py-0 ${CELL[i]} ${
              i < PARTNER_STATS.length - 1 ? "lg:border-r lg:border-dark-rule" : ""
            }`}
          >
            <span className={`type-stat ${stat.lime ? "text-lime" : "text-white"}`}>{stat.value}</span>
            <span className="text-dk-muted type-stat-caption">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
