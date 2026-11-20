/**
 * High-yield savings math. APY already includes compounding, so after one year a balance grows by exactly APY.
 * Example rates only — real rates change often. "Example, not a promise."
 */

export const HYS_APY = { min: 3, max: 5, step: 0.05, initial: 4 } as const; // percent
export const YEARS = [1, 5, 10] as const;

const cents = (n: number) => Math.round(n * 100) / 100;

/** Balance after `years` with no new deposits. `apy` is a fraction (0.04 = 4%). */
export function growth(balance: number, apy: number, years: number): number {
  return cents(balance * Math.pow(1 + apy, years));
}

/** Interest earned after `years`. */
export function interest(balance: number, apy: number, years: number): number {
  return cents(growth(balance, apy, years) - balance);
}

/** Interest in the first month. */
export function monthlyInterest(balance: number, apy: number): number {
  return cents(balance * (Math.pow(1 + apy, 1 / 12) - 1));
}

export function compare(balance: number, currentApy: number, hysApy: number) {
  return YEARS.map((years) => {
    const now = interest(balance, currentApy, years);
    const hys = interest(balance, hysApy, years);
    return { years, now, hys, extra: cents(hys - now) };
  });
}
