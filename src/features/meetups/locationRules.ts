/**
 * Pure rules for adding a campus spot. Mirrors the database checks on
 * meetup_locations (name 1-120 characters, building up to 160) so the admin
 * sees a friendly message instead of a constraint error.
 */

export const LOCATION_NAME_MAX = 120;
export const LOCATION_BUILDING_MAX = 160;

export type LocationInput = { name: unknown; building: unknown };
export type LocationErrors = { name?: string; building?: string };
export type LocationResult =
  | { ok: true; value: { name: string; building: string | null } }
  | { ok: false; errors: LocationErrors };

// Plain text only: no control characters (newlines, tabs, NUL).
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;
const length = (s: string) => Array.from(s).length;

export function validateLocationInput(input: LocationInput): LocationResult {
  const errors: LocationErrors = {};

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name) {
    errors.name = "Enter a name for the spot.";
  } else if (length(name) > LOCATION_NAME_MAX) {
    errors.name = `Keep the name to ${LOCATION_NAME_MAX} characters or fewer.`;
  } else if (CONTROL_CHARS.test(name)) {
    errors.name = "Use plain text only.";
  }

  let building: string | null = null;
  if (input.building !== null && input.building !== undefined) {
    if (typeof input.building !== "string") {
      errors.building = "Use plain text only.";
    } else {
      const trimmed = input.building.trim();
      if (length(trimmed) > LOCATION_BUILDING_MAX) {
        errors.building = `Keep the building to ${LOCATION_BUILDING_MAX} characters or fewer.`;
      } else if (CONTROL_CHARS.test(trimmed)) {
        errors.building = "Use plain text only.";
      } else {
        building = trimmed === "" ? null : trimmed;
      }
    }
  }

  if (errors.name || errors.building) return { ok: false, errors };
  return { ok: true, value: { name, building } };
}

/** Case-insensitive duplicate check against a school's existing spot names. */
export function isDuplicateLocationName(name: string, existing: string[]): boolean {
  const key = name.trim().toLowerCase();
  return existing.some((n) => n.trim().toLowerCase() === key);
}
