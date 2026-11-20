/**
 * F7 — scripted, illustrative price path for the crash simulator. Not real market data.
 * Shared by the server render (initial chart) and the client script (animation).
 */
export const START = 1000;
export const BOTTOM = 700; // a 30% drop
export const RECOVERED = 1050; // illustrative only — "Example, not a promise."

/** Calm, slightly wavy lead-in that ends exactly at START. */
export const BEFORE = [962, 970, 966, 978, 975, 984, 981, 990, 987, 994, 992, 998, START];
/** The drop: starts where BEFORE ends, ends exactly at BOTTOM. */
export const DROP = [START, 968, 941, 952, 893, 842, 861, 778, 731, BOTTOM];
/** Example recovery: starts at BOTTOM, ends at RECOVERED. */
export const RECOVERY = [BOTTOM, 712, 744, 731, 776, 802, 795, 846, 880, 871, 921, 956, 948, 1003, 1021, RECOVERED];

/** Total points on the x axis, so the chart never rescales while it animates. */
const TOTAL = BEFORE.length + DROP.length - 1 + RECOVERY.length - 1;

export const VIEW = { w: 320, h: 150, padX: 8, padY: 12, min: 620, max: 1100 };

export function x(i: number): number {
  return VIEW.padX + (i / (TOTAL - 1)) * (VIEW.w - 2 * VIEW.padX);
}
export function y(v: number): number {
  return VIEW.padY + ((VIEW.max - v) / (VIEW.max - VIEW.min)) * (VIEW.h - 2 * VIEW.padY);
}

/** SVG path for `values`, whose first point sits at x-index `offset`. `upto` (0–1) draws only part of it. */
export function pathFor(values: readonly number[], offset: number, upto = 1): string {
  const n = Math.max(1, Math.round((values.length - 1) * upto));
  const pts = values.slice(0, n + 1).map((v, i) => `${x(offset + i).toFixed(1)},${y(v).toFixed(1)}`);
  return `M${pts.join('L')}`;
}

export const OFFSETS = {
  before: 0,
  drop: BEFORE.length - 1,
  recovery: BEFORE.length - 1 + DROP.length - 1,
};
