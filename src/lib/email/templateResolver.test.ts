import { describe, expect, it } from "vitest";
import { resolveTemplateId } from "./templateResolver";

describe("meetup template ids", () => {
  it("UT has a hosted template per variant", () => {
    expect(resolveTemplateId("meetupProposed", "ut")).toBe("ut-propose-a-meetup-09");
    expect(resolveTemplateId("meetupAccepted", "ut")).toBe("ut-accept-a-meetup");
    expect(resolveTemplateId("meetupDeclined", "ut")).toBe("ut-decline-a-meetup");
  });

  it("other schools fall back to the default catalog entries", () => {
    expect(resolveTemplateId("meetupProposed", null)).toBe("meetup-proposed");
    expect(resolveTemplateId("meetupAccepted", null)).toBe("meetup-accepted");
    expect(resolveTemplateId("meetupDeclined", null)).toBe("meetup-declined");
  });
});
