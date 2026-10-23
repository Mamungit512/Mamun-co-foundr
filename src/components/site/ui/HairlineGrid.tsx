// The hairline grid (spec §3.3): a grid with a 1px gap over a rule-coloured
// fill, so cell boundaries are true 1px lines that never double. Radius sits
// on the container with overflow hidden; cells stay square. Collapses to a
// one-column ledger on phones, two columns on tablets.

type Columns = 1 | 2 | 3 | 4;
type Tone = "light" | "dark";

const COLUMNS: Record<Columns, string> = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

const TONE: Record<Tone, string> = {
  light: "border-rule-card bg-rule-card",
  dark: "border-dark-rule bg-dark-rule",
};

type Props = {
  children: React.ReactNode;
  columns?: Columns;
  tone?: Tone;
  /** Full-bleed grids run edge to edge and stay square (radius 0). */
  bleed?: boolean;
  className?: string;
};

export default function HairlineGrid({
  children,
  columns = 3,
  tone = "light",
  bleed = false,
  className = "",
}: Props) {
  return (
    <div
      data-reveal=""
      className={`grid grid-cols-1 gap-px overflow-hidden ${COLUMNS[columns]} ${TONE[tone]} ${
        bleed ? "" : "rounded-card border"
      } ${className}`}
    >
      {children}
    </div>
  );
}
