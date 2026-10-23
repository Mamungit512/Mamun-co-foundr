import Link from "next/link";

// Buttons (spec §6). Every button is a full pill. Primary is ink, secondary
// is outlined, lime is only for the header and drawer "Book a demo".
// External links (Calendly) always open in a new tab.

type Variant = "primary" | "secondary" | "secondary-dark" | "lime";
type Size = "sm" | "md" | "lg" | "tier" | "drawer";

const VARIANT: Record<Variant, string> = {
  primary: "bg-ink text-white",
  secondary: "border border-rule-button text-ink",
  "secondary-dark": "border border-dark-line text-white",
  lime: "bg-lime text-ink",
};

const SIZE: Record<Size, string> = {
  sm: "px-18 py-12 type-button-sm",
  md: "px-26 py-16 type-button",
  lg: "px-30 py-18 type-button-lg",
  tier: "px-20 py-14 type-button-tier",
  drawer: "w-full min-h-52 p-18 type-button-lg",
};

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  /** Where the CTA sits, for analytics (header / hero / band / footer…). */
  position?: string;
  className?: string;
};

export default function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  position,
  className = "",
}: Props) {
  const classes = `inline-flex min-h-44 flex-none items-center justify-center whitespace-nowrap rounded-pill ${VARIANT[variant]} ${SIZE[size]} ${className}`;
  const external = /^https?:\/\//.test(href);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener"
        data-cta={position ?? ""}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} data-cta={position ?? ""} className={classes}>
      {children}
    </Link>
  );
}
