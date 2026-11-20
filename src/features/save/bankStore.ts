/** In-memory demo bank shared by the DemoBank and HighYield islands. Never saved: a reload clears it. */
import type { DemoBank } from './mockBank';

export interface BankState {
  bank: DemoBank | null;
  /** Balance moved into the demo high-yield account. */
  hys: number;
}

let state: BankState = { bank: null, hys: 0 };
const listeners = new Set<(s: BankState) => void>();

export const getBank = () => state;

export function setBank(next: BankState) {
  state = next;
  for (const fn of listeners) fn(state);
}

export function onBank(fn: (s: BankState) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const cents = (n: number) => Math.round(n * 100) / 100;

/** Move money from checking or savings into the demo high-yield account. Returns false if there isn't enough. */
export function moveToHys(from: 'checking' | 'savings', amount: number): boolean {
  const bank = state.bank;
  if (!bank || !(amount > 0) || amount > bank[from] + 1e-9) return false;
  setBank({ bank: { ...bank, [from]: cents(bank[from] - amount) }, hys: cents(state.hys + amount) });
  return true;
}
