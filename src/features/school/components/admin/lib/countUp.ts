export function easeOutCubic(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - clamped, 3);
}

// The number to show `t` (0 to 1) of the way from `from` to `to`. Whole
// numbers only, so the display never flickers through decimals.
export function valueAt(from: number, to: number, t: number): number {
  return Math.round(from + (to - from) * easeOutCubic(t));
}
