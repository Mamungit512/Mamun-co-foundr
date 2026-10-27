import { ImageResponse } from "next/og";

// Share images (spec §13): 1200×630, the page's h1 on the ink ground with
// the lime accent and the corporate mark. No photography. Colours repeat
// the site.css tokens because next/og renders outside the stylesheet.
const INK = "#12120f";
const LIME = "#c7ea46";
const WHITE = "#ffffff";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Instrument Sans 700, subset to just the characters drawn. Fetched when the
// image is generated (at build for static routes) — never in the visitor's
// browser. Falls back to the default font if Google Fonts is unreachable.
async function instrumentSansBold(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@700&text=${encodeURIComponent(text)}`,
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export async function ogImage(title: string) {
  const font = await instrumentSansBold(`${title}MAMUN`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          padding: "72px 80px",
          fontFamily: font ? "Instrument Sans" : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* Corporate mark: circle with the rule overshooting both edges. */}
          <div style={{ position: "relative", width: 44, height: 44, display: "flex" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 44,
                height: 44,
                border: `3px solid ${WHITE}`,
                borderRadius: 22,
              }}
            />
            <div style={{ position: "absolute", left: -7, top: 20.5, width: 58, height: 3, background: WHITE }} />
          </div>
          <div style={{ color: WHITE, fontSize: 30, fontWeight: 700, letterSpacing: "0.24em" }}>MAMUN</div>
        </div>
        <div
          style={{
            color: WHITE,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: "-0.04em",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ width: 160, height: 10, background: LIME, borderRadius: 999 }} />
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: font ? [{ name: "Instrument Sans", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
