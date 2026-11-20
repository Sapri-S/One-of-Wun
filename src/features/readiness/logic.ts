/**
 * Deterministic readiness rules (FR-02). Evaluated in order:
 *   bills not covered  → stop (bills)
 *   debt over 15% APR  → stop (debt)
 *   under $1,000 saved → wait
 *   otherwise          → go
 */
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
