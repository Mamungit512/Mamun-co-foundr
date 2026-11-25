import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@clerk/nextjs/server", () => ({ clerkClient: async () => ({}) }));

import { buildUnsubscribeUrls } from "@/lib/email/unsubscribe";
import UnsubscribePage from "./page";

async function render(e?: string, t?: string) {
  return renderToStaticMarkup(await UnsubscribePage({ searchParams: Promise.resolve({ e, t }) }));
}

describe("/unsubscribe page", () => {
  it("shows the unsubscribing state for a valid link (the browser then confirms)", async () => {
    process.env.UNSUBSCRIBE_SECRET = "test-secret";
    const q = new URL(buildUnsubscribeUrls("a@utexas.edu")!.pageUrl).searchParams;
    const html = await render(q.get("e")!, q.get("t")!);
    expect(html).toContain("Unsubscribing");
  });

  it("explains a broken link", async () => {
    expect(await render("bad", "bad")).toContain("This link doesn");
  });
});
