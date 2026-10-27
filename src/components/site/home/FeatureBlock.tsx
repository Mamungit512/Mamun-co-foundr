// Feature block (spec §6): copy left, mock right, 1fr / 1.25fr from 1024px,
// equal columns on tablets, stacked on phones.

type Props = {
  id: string;
  tone?: "light" | "dark";
  copy: React.ReactNode;
  mock: React.ReactNode;
};

export default function FeatureBlock({ id, tone = "light", copy, mock }: Props) {
  return (
    <section
      aria-labelledby={id}
      className={`grid grid-cols-1 items-center gap-64 px-gutter py-fluid-92 md:grid-cols-2 lg:grid-cols-feature ${
        tone === "dark" ? "bg-dark" : "border-b border-rule"
      }`}
    >
      <div className="flex flex-col gap-18">{copy}</div>
      {mock}
    </section>
  );
}
