// Tags inside product mocks: a lime filled badge (4px radius) or an
// outlined pill. "light" sits on white, "dark" on a dark mock. Light mocks
// that are not [data-mock] frames take the mobile type floor ("floor").

type Size = "sm" | "dense" | "md" | "lg";

// Font size + padding per size, as drawn in Main.dc.html.
const SIZE: Record<Size, string> = {
  sm: "type-m-11 px-8 py-6",
  dense: "type-m-11 px-8 py-5",
  md: "type-m-115 px-9 py-7",
  lg: "type-m-125 px-15 py-11",
};

type Props = {
  children: React.ReactNode;
  variant: "filled" | "outline";
  tone?: "light" | "dark";
  size?: Size;
  /** Raise to the mobile type floor below 1024px (light, non-mock cards). */
  floor?: boolean;
  /** Keep on one line. Off by default for the larger platform tags, which
      the prototype lets wrap on narrow screens. */
  nowrap?: boolean;
};

export default function MockTag({
  children,
  variant,
  tone = "light",
  size = "sm",
  floor = false,
  nowrap = size === "sm",
}: Props) {
  const filled = variant === "filled";
  const type = floor
    ? `px-8 py-6 ${filled ? "type-badge" : "type-pill"}`
    : `${SIZE[size]} ${filled ? "font-semibold" : "font-medium"}`;
  const look = filled
    ? "rounded-badge bg-lime text-ink"
    : tone === "dark"
      ? `rounded-pill border border-dark-line ${size === "sm" ? "text-dk-muted" : "text-dk-body"}`
      : "rounded-pill border border-rule-mock text-text-caption";

  return (
    <span className={`inline-block ${nowrap ? "whitespace-nowrap" : ""} ${look} ${type}`}>{children}</span>
  );
}
