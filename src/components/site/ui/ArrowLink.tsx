import Link from "next/link";

// Text link / arrow (spec §6): 600 14px, 2px lime underline, trailing "→".
// The drawn box stays 20px so the underline sits on the baseline; tap-44
// gives it the full 44px hit area (spec §18).

type Props = {
  href: string;
  children: React.ReactNode;
  /** Text colour; the underline is always lime. */
  tone?: "light" | "dark";
  /** Pin to the start of a flex column (default); off inside a baseline row. */
  selfStart?: boolean;
  className?: string;
};

export default function ArrowLink({
  href,
  children,
  tone = "light",
  selfStart = true,
  className = "",
}: Props) {
  const classes = `${selfStart ? "self-start" : ""} tap-44 border-b-2 border-lime pb-4 type-button ${
    tone === "dark" ? "text-white" : "text-ink"
  } ${className}`;
  const label = (
    <>
      {children} <span aria-hidden="true">→</span>
    </>
  );

  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener" data-arrow="" className={classes}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} data-arrow="" className={classes}>
      {label}
    </Link>
  );
}
