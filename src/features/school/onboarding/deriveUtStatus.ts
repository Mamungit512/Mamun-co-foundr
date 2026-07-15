export function hasGraduationYearPassed(gradYear: number | undefined): boolean {
  if (gradYear === undefined) return false;
  return gradYear < new Date().getFullYear();
}

// A self-reported "student" whose graduation year has already passed is
// actually alumni; "alumni" is trusted as-is regardless of gradYear since
// someone can return to school after graduating.
export function deriveUtStatus(
  utStatus: "student" | "alumni" | undefined,
  gradYear: number | undefined,
): "student" | "alumni" | undefined {
  if (utStatus === "student" && hasGraduationYearPassed(gradYear)) return "alumni";
  return utStatus;
}
