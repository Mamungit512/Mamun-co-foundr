import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/components/site/seo/ogImage";
import { MATCHING_HERO } from "@/content/site/matching";

// Share image for /matching (spec §13): the page's h1.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = MATCHING_HERO.title;

export default function Image() {
  return ogImage(MATCHING_HERO.title);
}
