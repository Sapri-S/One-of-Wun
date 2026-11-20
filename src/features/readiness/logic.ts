/**
 * Deterministic readiness rules (FR-02). Evaluated in order:
 *   bills not covered  → stop (bills)
 *   debt over 15% APR  → stop (debt)
 *   under $1,000 saved → wait
 *   otherwise          → go
 */
import type { Profile } from '../roadmap/profiles.ts';

export interface Answers {
  highInterestDebt: boolean | null;
  hasThousandSaved: boolean | null;
  billsCovered: boolean | null;
}
export type Result =
  | { status: 'stop'; reason: 'bills' | 'debt' }
  | { status: 'wait'; reason: 'buffer' }
  | { status: 'go'; reason: 'ready' };

export function evaluate(a: Answers): Result | null {
  if (a.highInterestDebt === null || a.hasThousandSaved === null || a.billsCovered === null) return null;
  if (!a.billsCovered) return { status: 'stop', reason: 'bills' };
  if (a.highInterestDebt) return { status: 'stop', reason: 'debt' };
  if (!a.hasThousandSaved) return { status: 'wait', reason: 'buffer' };
  return { status: 'go', reason: 'ready' };
}

/**
 * Place the visitor on the 8-step path from their answers (0-based step indexes):
 *   bills not covered        → step 1 (cover the basics)
 *   under $1,000 saved       → step 3 (save a cushion)
 *   high-interest debt only  → step 5 (pay off debt); step 4 (employer match) stays open alongside it
 *   all safe                 → step 6 (grow the cushion), investing steps open
 * Investing steps (7–8) stay gated until there's no high-interest debt and a $1,000 cushion.
 */
export function placeOnPath(a: Answers): Profile | null {
  const r = evaluate(a);
  if (!r) return null;
  const gated = [6, 7];
  if (r.reason === 'bills') return { done: [], current: 0, gated, open: [], status: 'stop' };
  if (!a.hasThousandSaved) return { done: [0, 1], current: 2, gated, open: [], status: r.status };
  if (r.reason === 'debt') return { done: [0, 1, 2], current: 4, gated, open: [3], status: 'stop' };
  return { done: [0, 1, 2, 3, 4], current: 5, gated: [], open: [6, 7], status: 'go' };
}
