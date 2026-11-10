import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AdminTabs from "./AdminTabs";

const render = (features?: { meetups: boolean }) =>
  renderToStaticMarkup(
    createElement(AdminTabs, { activeTab: "overview", onSelect: () => {}, features }),
  );

describe("AdminTabs", () => {
  it("leaves out the Meetups tab with the flag off or unset", () => {
    expect(render()).not.toContain("Meetups");
    expect(render({ meetups: false })).not.toContain("Meetups");
  });

  it("shows the Meetups tab when the school's flag is on", () => {
    expect(render({ meetups: true })).toContain("Meetups");
  });

  it("always shows the other tabs", () => {
    for (const features of [undefined, { meetups: false }, { meetups: true }]) {
      const html = render(features);
      for (const label of ["Overview", "Roster", "Connections", "Sources", "Reports"]) {
        expect(html).toContain(label);
      }
    }
  });
});
