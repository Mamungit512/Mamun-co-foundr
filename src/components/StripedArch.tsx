import React from "react";

interface StripedArchProps {
  className?: string; // Additional Tailwind classes for SVG wrapper
  width?: number; // width of SVG viewBox and radii (default 100)
  height?: number; // height of SVG viewBox (default 55)
  rx?: number; // ellipse horizontal radius (default 50)
  ry?: number; // ellipse vertical radius (default 55)
  cx?: number; // ellipse center x (default 50)
  cy?: number; // ellipse center y (default 55)
  stripeColors?: [string, string]; // two colors for stripes
  stripeWidth?: number; // width of each stripe segment
  stripeHeight?: number; // height of each stripe segment
  strokeWidth?: number; // stroke width if you want stroke instead of fill (optional)
}

const StripedArch: React.FC<StripedArchProps> = ({
  className = "pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-[130%] h-48",
  width = 100,
  height = 55,
  rx = 50,
  ry = 55,
  cx = 50,
  cy = 55,
  stripeColors = ["#9B5753", "#D7CFCE"],
  stripeWidth = 10,
  stripeHeight = 12,
  strokeWidth,
}) => {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
    >
      <defs>
        <pattern
          id="stripes"
          width={stripeWidth}
          height={stripeHeight}
          patternUnits="userSpaceOnUse"
        >
          <rect
            width={stripeWidth / 2}
            height={stripeHeight}
            fill={stripeColors[0]}
          />
          <rect
            x={stripeWidth / 2}
            width={stripeWidth / 2}
            height={stripeHeight}
            fill={stripeColors[1]}
          />
        </pattern>
      </defs>

      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={strokeWidth ? "none" : "url(#stripes)"}
        stroke={strokeWidth ? "url(#stripes)" : "none"}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export default StripedArch;
