import { describe, it, expect } from "vitest";
import { ADMIN_TABS, parseAdminTab } from "./tabConfig";

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
    // Feature-gated tabs are covered in "meetups tab (per-school feature)" below.
    for (const tab of ADMIN_TABS.filter((t) => !t.hidden && !t.feature)) {
      expect(parseAdminTab(tab.id)).toBe(tab.id);
    }
  });
});

describe("meetups tab (per-school feature)", () => {
  it("is not reachable by default, with the flag off", () => {
    expect(parseAdminTab("meetups")).toBe("overview");
    expect(parseAdminTab("meetups", { meetups: false })).toBe("overview");
  });

  it("is reachable when the school's flag is on", () => {
    expect(parseAdminTab("meetups", { meetups: true })).toBe("meetups");
  });

  it("does not change any other tab", () => {
    for (const tab of ADMIN_TABS.filter((t) => !t.hidden && !t.feature)) {
      expect(parseAdminTab(tab.id, { meetups: false })).toBe(tab.id);
      expect(parseAdminTab(tab.id, { meetups: true })).toBe(tab.id);
    }
  });

  it("is only gated by its own switch", () => {
    const meetups = ADMIN_TABS.find((t) => t.id === "meetups");
    expect(meetups?.feature).toBe("meetups");
    expect(meetups?.hidden).toBeUndefined();
  });
});
