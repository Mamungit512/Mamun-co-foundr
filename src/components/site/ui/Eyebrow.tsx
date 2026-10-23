// Eyebrow (spec §6): 600 11px, +.18em, caps. Grey on light, lime on dark,
// lime-deep when it signals "live".

type Tone = "light" | "dark" | "live";

const TONE: Record<Tone, string> = {
  light: "text-text-eyebrow",
  dark: "text-lime",
  live: "text-lime-deep",
};

type Props = {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
};

export default function Eyebrow({ children, tone = "light", className = "" }: Props) {
  return <p className={`type-eyebrow ${TONE[tone]} ${className}`}>{children}</p>;
}
