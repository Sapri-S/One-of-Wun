/**
 * Demo bank: made-up accounts and 30 days of transactions within fixed ranges. No real bank, no network.
 * Seeded, so the same seed always gives the same data (unit-tested in tests/unit/save.test.ts).
 */

export const DEMO_BANKS = [
  { id: 'maple', name: 'Maple Demo Bank' },
  { id: 'riverside', name: 'Riverside Demo Credit Union' },
  { id: 'summit', name: 'Summit Demo Bank' },
] as const;
export type BankId = (typeof DEMO_BANKS)[number]['id'];

export const RANGES = {
  checking: [400, 4500],
  savings: [0, 3000],
  savingsApy: [0.0001, 0.005],
} as const;

export type Category = 'income' | 'rent' | 'groceries' | 'gas' | 'utilities' | 'dining' | 'phone' | 'transit';

/** [min count, max count, min $, max $] per category for one month. Income is positive, the rest negative. */
export const TX_RULES: Record<Category, [number, number, number, number]> = {
  income: [2, 2, 900, 2200],
  rent: [1, 1, 700, 1600],
  groceries: [4, 6, 25, 140],
  gas: [3, 5, 20, 65],
  utilities: [1, 2, 40, 180],
  dining: [3, 6, 8, 45],
  phone: [1, 1, 30, 90],
  transit: [0, 4, 3, 30],
};

export interface Tx {
  /** Days before today (0–29). */
  daysAgo: number;
  category: Category;
  amount: number;
}

export interface DemoBank {
  bankId: BankId;
  bankName: string;
  checking: number;
  savings: number;
  savingsApy: number;
  transactions: Tx[];
}

/** Small deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cents = (n: number) => Math.round(n * 100) / 100;

export function generateBank(bankId: BankId, seed: number): DemoBank {
  const r = rng(seed);
  const between = (lo: number, hi: number) => lo + r() * (hi - lo);
  const int = (lo: number, hi: number) => Math.floor(between(lo, hi + 1));
  const transactions: Tx[] = [];
  for (const [category, [cMin, cMax, aMin, aMax]] of Object.entries(TX_RULES) as [Category, [number, number, number, number]][]) {
    const count = int(cMin, cMax);
    for (let i = 0; i < count; i++) {
      // Paychecks land two weeks apart; rent near the start of the month; the rest anywhere.
      const daysAgo = category === 'income' ? Math.min(29, 2 + i * 14 + int(0, 1)) : category === 'rent' ? int(20, 29) : int(0, 29);
      const amount = cents(between(aMin, aMax));
      transactions.push({ daysAgo, category, amount: category === 'income' ? amount : -amount });
    }
  }
  transactions.sort((a, b) => a.daysAgo - b.daysAgo);
  return {
    bankId,
    bankName: DEMO_BANKS.find((b) => b.id === bankId)!.name,
    checking: cents(between(RANGES.checking[0], RANGES.checking[1])),
    savings: cents(between(RANGES.savings[0], RANGES.savings[1])),
    savingsApy: Math.round(between(RANGES.savingsApy[0], RANGES.savingsApy[1]) * 10000) / 10000,
    transactions,
  };
}

/** Total spent per category (positive numbers), biggest first. Income left out. */
export function spendingByCategory(txs: Tx[]): { category: Category; total: number }[] {
  const totals = new Map<Category, number>();
  for (const t of txs) if (t.amount < 0) totals.set(t.category, cents((totals.get(t.category) ?? 0) - t.amount));
  return [...totals.entries()].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

export function monthTotals(txs: Tx[]) {
  const income = cents(txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0));
  const spent = cents(-txs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  return { income, spent, left: cents(income - spent) };
}
