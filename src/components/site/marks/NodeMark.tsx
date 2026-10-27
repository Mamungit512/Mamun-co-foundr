// Co-founder matching node mark (spec §4.1): a lime hub ringed in the
// current text colour, four arms and four satellite dots, drawn on a 64×64
// grid and scaled to the target size. Decorative.

type Props = {
  /** 16px footer · 18px nav · 34px beside the matching heading. */
  size?: 16 | 18 | 34;
  className?: string;
};

const SIZE_CLASS = { 16: "node-16", 18: "node-18", 34: "node-34" } as const;

export default function NodeMark({ size = 18, className = "" }: Props) {
  return (
    <span aria-hidden="true" className={`node-mark ${SIZE_CLASS[size]} ${className}`}>
      <span>
        <span className="arm arm-n" />
        <span className="arm" />
        <span className="arm arm-s" />
        <span className="arm arm-w" />
        <span className="hub" />
        <span className="dot dot-n" />
        <span className="dot dot-e" />
        <span className="dot dot-s" />
        <span className="dot dot-w" />
      </span>
    </span>
  );
}
