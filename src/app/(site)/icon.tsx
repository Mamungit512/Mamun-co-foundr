import { markIcon } from "@/components/site/seo/markIcon";

// Favicon, 32px (spec §15). The 180px Apple touch icon is apple-icon.tsx;
// the 512px is /logo.png.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return markIcon(32);
}
