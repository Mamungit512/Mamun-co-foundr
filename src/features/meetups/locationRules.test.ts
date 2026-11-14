import { describe, expect, it } from "vitest";
import {
  isDuplicateLocationName,
  validateLocationInput,
  LOCATION_BUILDING_MAX,
  LOCATION_NAME_MAX,
} from "./locationRules";

describe("validateLocationInput", () => {
  it("accepts a name and trims it", () => {
    expect(validateLocationInput({ name: "  Synthetic Lounge  ", building: undefined })).toEqual({
      ok: true,
      value: { name: "Synthetic Lounge", building: null },
    });
  });

  it("keeps an optional building, and treats blank as none", () => {
    expect(validateLocationInput({ name: "A", building: " Hall " })).toMatchObject({
      ok: true,
      value: { building: "Hall" },
    });
    for (const building of ["", "   ", null, undefined]) {
      expect(validateLocationInput({ name: "A", building })).toMatchObject({
        ok: true,
        value: { building: null },
      });
    }
  });

  it("requires a name", () => {
    for (const name of ["", "   ", null, undefined, 5, {}]) {
      const r = validateLocationInput({ name, building: null });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.name).toBeDefined();
    }
  });

  it("limits the name to 120 characters, as the database does", () => {
    expect(validateLocationInput({ name: "x".repeat(LOCATION_NAME_MAX), building: null }).ok).toBe(true);
    expect(validateLocationInput({ name: "x".repeat(LOCATION_NAME_MAX + 1), building: null }).ok).toBe(false);
  });

  it("limits the building to 160 characters", () => {
    expect(validateLocationInput({ name: "A", building: "x".repeat(LOCATION_BUILDING_MAX) }).ok).toBe(true);
    const r = validateLocationInput({ name: "A", building: "x".repeat(LOCATION_BUILDING_MAX + 1) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.building).toBeDefined();
  });

  it("counts characters, not UTF-16 units", () => {
    expect(validateLocationInput({ name: "😀".repeat(LOCATION_NAME_MAX), building: null }).ok).toBe(true);
    expect(validateLocationInput({ name: "😀".repeat(LOCATION_NAME_MAX + 1), building: null }).ok).toBe(false);
  });

  it("rejects control characters", () => {
    for (const bad of ["a\nb", "a\tb", "a\u0000b"]) {
      expect(validateLocationInput({ name: bad, building: null }).ok).toBe(false);
      expect(validateLocationInput({ name: "A", building: bad }).ok).toBe(false);
    }
  });

  it("rejects a non-string building", () => {
    expect(validateLocationInput({ name: "A", building: 5 }).ok).toBe(false);
    expect(validateLocationInput({ name: "A", building: ["x"] }).ok).toBe(false);
  });

  it("reports both field errors at once", () => {
    const r = validateLocationInput({ name: "", building: "x".repeat(500) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["building", "name"]);
  });

  it("does not alter markup-looking text (it is escaped where it is shown)", () => {
    const r = validateLocationInput({ name: "<b>Union</b> & Co", building: null });
    expect(r.ok && r.value.name).toBe("<b>Union</b> & Co");
  });
});

describe("isDuplicateLocationName", () => {
  it("ignores case and surrounding space", () => {
    expect(isDuplicateLocationName(" texas union ", ["Texas Union", "PCL"])).toBe(true);
  });
  it("is false for a new name", () => {
    expect(isDuplicateLocationName("Gates", ["Texas Union", "PCL"])).toBe(false);
    expect(isDuplicateLocationName("Gates", [])).toBe(false);
  });
});
