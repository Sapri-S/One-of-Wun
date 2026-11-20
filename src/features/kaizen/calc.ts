/**
 * Kaizen calculator math (FR-04, US-02). Pure functions — unit tested in tests/unit/calc.test.ts.
 * Formula from the PRD: FV = weekly × 52 × ((1 + r)^years − 1) / r
 */
export const RATES = [0.04, 0.06, 0.08] as const;
export const GENERATION_YEARS = 25;
export const WEEKLY = { min: 5, max: 100, step: 5, initial: 5 } as const;
export const YEARS = { min: 10, max: 60, step: 1, initial: 30 } as const;

/** Future value of weekly saving, contributed yearly (×52) and grown once a year at rate r. */
export function futureValue(weekly: number, years: number, r: number): number {
  const yearly = weekly * 52;
  if (r === 0) return yearly * years;
  return (yearly * (Math.pow(1 + r, years) - 1)) / r;
}

/** Total money put in. */
export function totalContributed(weekly: number, years: number): number {
  return weekly * 52 * years;
}

/** Balance at the end of each year 0..years (for the chart). */
export function yearlySeries(weekly: number, years: number, r: number): number[] {
  const out: number[] = [];
  for (let y = 0; y <= years; y++) out.push(futureValue(weekly, y, r));
  return out;
}

/** You → kids → grandkids: each later tier is the earlier one left alone for 25 more years. */
export function generations(weekly: number, years: number, r: number) {
  const you = futureValue(weekly, years, r);
  const kids = you * Math.pow(1 + r, GENERATION_YEARS);
  const grandkids = kids * Math.pow(1 + r, GENERATION_YEARS);
  return { you, kids, grandkids };
}

export function clamp(n: number, min: number, max: number, step = 1): number {
  const snapped = Math.round((n - min) / step) * step + min;
  return Math.min(max, Math.max(min, snapped));
}
