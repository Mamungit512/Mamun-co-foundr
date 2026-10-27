import { TRUST } from "@/content/site/home";

// Per-cell padding. Phones: every cell on the page gutter. Tablet: two
// columns, the odd last cell spanning the row. Desktop, as drawn: the outer
// cells take the gutter on their outside edge so the text lines up with the
// page.
const CELL_PADDING = [
  "md:pr-30 lg:pt-30 lg:pr-30 lg:pb-34 lg:pl-gutter",
  "md:pl-30 lg:p-30",
  "md:col-span-2 lg:col-span-1 lg:pt-trust-last lg:pr-gutter lg:pb-34 lg:pl-30",
];

// 04 Trust strip — full-bleed dark band, three cells. Below desktop the
// dividers become a 1px grid gap, so stacked cells read as a ledger (spec §9).
export default function TrustStrip() {
  return (
    <section
      aria-label="How it runs on your campus"
      className="grid grid-cols-1 gap-px bg-dark-rule md:grid-cols-2 lg:grid-cols-3 lg:bg-dark"
    >
      {TRUST.map((item, i) => (
        <div
          key={item.title}
          data-cell=""
          className={`flex flex-col gap-6 bg-dark px-gutter pt-30 pb-34 ${CELL_PADDING[i]} ${
            i < TRUST.length - 1 ? "lg:border-r lg:border-dark-rule" : ""
          }`}
        >
          <h3 className={`type-trust-title ${i === 0 ? "text-lime" : "text-white"}`}>{item.title}</h3>
          <p className="text-dk-muted type-trust-body">{item.body}</p>
        </div>
      ))}
    </section>
  );
}
