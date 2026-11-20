/**
 * F6 data: the three building blocks. Numbers are typical, illustrative values (SHARED §7 F6).
 * No tickers, fund names or brokers — ever.
 */
export const AMOUNTS = [100, 1000, 10000] as const;
export type Amount = (typeof AMOUNTS)[number];
export const DEFAULT_AMOUNT: Amount = 1000;

export const FUNDS = [
  { id: 'index', term: 'index-fund', risk: 3, ratio: 0.0005 },
  { id: 'stock', term: 'single-stock', risk: 5, ratio: 0 },
  { id: 'bond', term: 'bond-fund', risk: 2, ratio: 0.001 },
] as const;
export type FundId = (typeof FUNDS)[number]['id'];

/** Yearly cost in dollars of holding `amount` in a fund with this expense ratio. */
export function yearlyCost(amount: number, ratio: number): number {
  return Math.round(amount * ratio * 100) / 100;
}

/** "$0.50", "$5", "$0" — cents only when the amount isn't a whole number of dollars. */
export function formatCost(n: number, locale: string): string {
  const whole = Number.isInteger(n);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(n);
}
