import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/components/site/seo/ogImage";
import { PLATFORM_HERO } from "@/content/site/platform";

// Share image for /platform (spec §13): the page's h1.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = PLATFORM_HERO.title;

export default function Image() {
  return ogImage(PLATFORM_HERO.title);
}
