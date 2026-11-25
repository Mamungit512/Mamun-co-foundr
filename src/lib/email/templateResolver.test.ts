import { describe, expect, it } from "vitest";
import { resolveTemplateId } from "./templateResolver";

describe("meetup template ids", () => {
  it("UT has a hosted template per variant", () => {
    expect(resolveTemplateId("meetupProposed", "ut")).toBe("ut-propose-a-meetup-09");
    expect(resolveTemplateId("meetupAccepted", "ut")).toBe("ut-meetup-accepted-10");
    expect(resolveTemplateId("meetupDeclined", "ut")).toBe("ut-meetup-declined-11");
  });

  it("other schools fall back to the default catalog entries", () => {
    expect(resolveTemplateId("meetupProposed", null)).toBe("meetup-proposed");
    expect(resolveTemplateId("meetupAccepted", null)).toBe("meetup-accepted");
    expect(resolveTemplateId("meetupDeclined", null)).toBe("meetup-declined");
  });
});

describe("profile reminder template id", () => {
  it("UT uses its hosted profile-completion template", () => {
    expect(resolveTemplateId("profileReminder", "ut")).toBe(
      "profile-completion-03-1",
    );
  });
});
