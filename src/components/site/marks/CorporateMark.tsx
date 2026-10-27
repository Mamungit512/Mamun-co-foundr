// Corporate mark: a circle with a rule overshooting both edges (spec §4).
// Built from boxes and coloured by currentColor. Decorative — the link that
// wraps it carries the accessible name.

type Props = {
  /** "sm" is the 20px header/footer mark; "hero" is the 46px hero mark. */
  size?: "sm" | "hero";
  className?: string;
};

export default function CorporateMark({ size = "sm", className = "" }: Props) {
  const sizeClass = size === "hero" ? "mark-hero" : "mark-20";
  return (
    <span aria-hidden="true" className={`corporate-mark ${sizeClass} ${className}`} />
  );
}
