import { markIcon } from "@/components/site/seo/markIcon";

// The 512px mark at a fixed URL (spec §15): the logo in the Organization
// JSON-LD. Rendered once at build.
export const dynamic = "force-static";

export function GET() {
  return markIcon(512);
}
