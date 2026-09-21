import { describe, it, expect } from "vitest";
import { ensureAbsoluteUrl } from "../url";

describe("ensureAbsoluteUrl", () => {
  it("leaves already-absolute http/https URLs unchanged", () => {
    expect(ensureAbsoluteUrl("https://linkedin.com/in/test")).toBe(
      "https://linkedin.com/in/test",
    );
    expect(ensureAbsoluteUrl("http://example.com")).toBe(
      "http://example.com",
    );
  });

  it("prepends https:// to schemeless values", () => {
    expect(ensureAbsoluteUrl("linkedin.com/in/test")).toBe(
      "https://linkedin.com/in/test",
    );
    expect(ensureAbsoluteUrl("github.com/test")).toBe(
      "https://github.com/test",
    );
  });

  it("trims whitespace before checking for a scheme", () => {
    expect(ensureAbsoluteUrl("  linkedin.com/in/test  ")).toBe(
      "https://linkedin.com/in/test",
    );
  });

  it("returns null for empty, whitespace-only, or nullish input", () => {
    expect(ensureAbsoluteUrl("")).toBeNull();
    expect(ensureAbsoluteUrl("   ")).toBeNull();
    expect(ensureAbsoluteUrl(null)).toBeNull();
    expect(ensureAbsoluteUrl(undefined)).toBeNull();
  });
});
