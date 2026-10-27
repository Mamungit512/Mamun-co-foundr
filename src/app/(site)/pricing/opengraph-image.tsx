import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/components/site/seo/ogImage";
import { PRICING_HERO } from "@/content/site/pricing";

// Share image for /pricing (spec §13): the page's h1.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = PRICING_HERO.title;

export default function Image() {
  return ogImage(PRICING_HERO.title);
}
