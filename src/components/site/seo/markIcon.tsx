import { ImageResponse } from "next/og";

// The corporate mark as a square PNG (spec §15): ink circle with the bar
// overshooting both edges, on white. Proportions follow the 32px favicon —
// 20px circle, 2px stroke, 28px bar. Colours repeat the site.css tokens
// because next/og renders outside it.
export function markIcon(px: number) {
  const unit = px / 32;
  const circle = 20 * unit;
  const stroke = 2 * unit;
  const bar = 28 * unit;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <div style={{ position: "relative", width: circle, height: circle, display: "flex" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: circle, height: circle, border: `${stroke}px solid #12120f`, borderRadius: circle / 2 }} />
          <div style={{ position: "absolute", left: (circle - bar) / 2, top: (circle - stroke) / 2, width: bar, height: stroke, background: "#12120f" }} />
        </div>
      </div>
    ),
    { width: px, height: px },
  );
}
