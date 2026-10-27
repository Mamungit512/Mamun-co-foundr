import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/components/site/seo/ogImage";
import { PARTNER_INTRO } from "@/content/site/partner";

// Share image for /partner (spec §13): the page's h1.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = PARTNER_INTRO.title;

export default function Image() {
  return ogImage(PARTNER_INTRO.title);
}
