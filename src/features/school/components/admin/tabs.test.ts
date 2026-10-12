import { describe, it, expect } from "vitest";
import { ADMIN_TABS, parseAdminTab } from "./tabs";

describe("parseAdminTab", () => {
  it("defaults to overview when no tab is given", () => {
    expect(parseAdminTab(null)).toBe("overview");
    expect(parseAdminTab("")).toBe("overview");
  });

  it("sends the retired analytics tab to overview", () => {
    expect(parseAdminTab("analytics")).toBe("overview");
  });

  it("reaches sources", () => {
    expect(parseAdminTab("sources")).toBe("sources");
  });

  it("does not reach hidden tabs", () => {
    for (const tab of ADMIN_TABS.filter((t) => t.hidden)) {
      expect(parseAdminTab(tab.id)).toBe("overview");
    }
  });

  it("sends unknown values to overview", () => {
    expect(parseAdminTab("nope")).toBe("overview");
    expect(parseAdminTab("ROSTER")).toBe("overview");
  });

  it("passes every visible tab through", () => {
    for (const tab of ADMIN_TABS.filter((t) => !t.hidden)) {
      expect(parseAdminTab(tab.id)).toBe(tab.id);
    }
  });
});
