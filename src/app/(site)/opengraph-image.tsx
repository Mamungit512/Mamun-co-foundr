import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/components/site/seo/ogImage";
import { HERO } from "@/content/site/home";

// Share image for home (spec §13): the page's h1.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = HERO.title;

export default function Image() {
  return ogImage(HERO.title);
}
