import { markIcon } from "@/components/site/seo/markIcon";

// Apple touch icon, 180px (spec §15).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return markIcon(180);
}
