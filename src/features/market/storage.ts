/**
 * The ONE thing this site stores: the play-money portfolio, in this browser only (SHARED.md rule 4 exception).
 * Every read and write is wrapped, so private windows or blocked storage just start fresh.
 */
import { initialState, isState, type PortfolioState } from './portfolio';

export const STORAGE_KEY = 'wywtb.mockMarket.v1';

export function load(): PortfolioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isState(parsed)) return parsed;
    }
  } catch {
    /* storage blocked or corrupt: start fresh */
  }
  return initialState();
}

export function save(state: PortfolioState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage blocked: the portfolio still works for this visit */
  }
}

export function clear(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
