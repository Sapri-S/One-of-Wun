/**
 * Mock market: pure play-money portfolio math (no DOM, no storage). Unit-tested in tests/unit/market.test.ts.
 * Market orders fill at the given price. Shares are fractional to 4 decimals; money is rounded to cents.
 */

export const START_CASH = 10_000;
export const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'AMZN', 'NVDA', 'TSLA', 'SPY', 'VTI'];
export const MAX_TRADES = 200;

export interface Holding {
  shares: number;
  /** Total cost basis in dollars. Average cost = cost / shares. */
  cost: number;
}

export interface Trade {
  time: number;
  side: 'buy' | 'sell';
  symbol: string;
  shares: number;
  price: number;
  total: number;
}

export interface PortfolioState {
  v: 1;
  cash: number;
  holdings: Record<string, Holding>;
  trades: Trade[];
  watchlist: string[];
}

export type OrderSize = { shares: number } | { dollars: number };
export type TradeError = 'amount' | 'price' | 'cash' | 'shares';
export type TradeResult = { ok: true; state: PortfolioState; trade: Trade } | { ok: false; reason: TradeError };

export const cents = (n: number) => Math.round(n * 100) / 100;
const roundShares = (n: number) => Math.round(n * 1e4) / 1e4;
const floorShares = (n: number) => Math.floor(n * 1e4 + 1e-9) / 1e4;

export function initialState(): PortfolioState {
  return { v: 1, cash: START_CASH, holdings: {}, trades: [], watchlist: [...DEFAULT_WATCHLIST] };
}

/** How many shares an order means at this price (dollar orders round down so you never overspend). */
export function sharesFor(size: OrderSize, price: number): number {
  return 'shares' in size ? roundShares(size.shares) : floorShares(size.dollars / price);
}

export function buy(state: PortfolioState, symbol: string, price: number, size: OrderSize, now = Date.now()): TradeResult {
  if (!(price > 0)) return { ok: false, reason: 'price' };
  const shares = sharesFor(size, price);
  if (!(shares > 0)) return { ok: false, reason: 'amount' };
  const total = cents(shares * price);
  if (total > state.cash + 1e-9) return { ok: false, reason: 'cash' };
  const prev = state.holdings[symbol] ?? { shares: 0, cost: 0 };
  const trade: Trade = { time: now, side: 'buy', symbol, shares, price, total };
  return {
    ok: true,
    trade,
    state: {
      ...state,
      cash: cents(state.cash - total),
      holdings: { ...state.holdings, [symbol]: { shares: roundShares(prev.shares + shares), cost: cents(prev.cost + total) } },
      trades: [trade, ...state.trades].slice(0, MAX_TRADES),
    },
  };
}

export function sell(state: PortfolioState, symbol: string, price: number, size: OrderSize, now = Date.now()): TradeResult {
  if (!(price > 0)) return { ok: false, reason: 'price' };
  let shares = sharesFor(size, price);
  if (!(shares > 0)) return { ok: false, reason: 'amount' };
  const held = state.holdings[symbol];
  if (!held) return { ok: false, reason: 'shares' };
  if (shares > held.shares + 1e-6) {
    // A dollar order for (almost) everything you own sells everything instead of failing on rounding.
    if ('dollars' in size && size.dollars <= cents(held.shares * price) + 0.01) shares = held.shares;
    else return { ok: false, reason: 'shares' };
  }
  shares = Math.min(shares, held.shares);
  const total = cents(shares * price);
  const remaining = roundShares(held.shares - shares);
  const holdings = { ...state.holdings };
  if (remaining <= 0) delete holdings[symbol];
  else holdings[symbol] = { shares: remaining, cost: cents(held.cost * (remaining / held.shares)) };
  const trade: Trade = { time: now, side: 'sell', symbol, shares, price, total };
  return {
    ok: true,
    trade,
    state: { ...state, cash: cents(state.cash + total), holdings, trades: [trade, ...state.trades].slice(0, MAX_TRADES) },
  };
}

export interface Row {
  symbol: string;
  shares: number;
  avgCost: number;
  price: number | null;
  value: number;
  pl: number;
  plPct: number;
}

/** Value everything at the latest known prices (falls back to average cost when a price is missing). */
export function valuation(state: PortfolioState, prices: Record<string, number | undefined>) {
  const rows: Row[] = Object.entries(state.holdings)
    .map(([symbol, h]) => {
      const avgCost = h.shares > 0 ? h.cost / h.shares : 0;
      const price = prices[symbol] ?? null;
      const value = cents(h.shares * (price ?? avgCost));
      const pl = cents(value - h.cost);
      return { symbol, shares: h.shares, avgCost, price, value, pl, plPct: h.cost > 0 ? (pl / h.cost) * 100 : 0 };
    })
    .sort((a, b) => b.value - a.value);
  const invested = cents(rows.reduce((s, r) => s + r.value, 0));
  const total = cents(state.cash + invested);
  const pl = cents(total - START_CASH);
  return { rows, invested, total, pl, plPct: (pl / START_CASH) * 100 };
}

export function addToWatchlist(state: PortfolioState, symbol: string): PortfolioState {
  return state.watchlist.includes(symbol) ? state : { ...state, watchlist: [...state.watchlist, symbol].slice(0, 20) };
}

export function removeFromWatchlist(state: PortfolioState, symbol: string): PortfolioState {
  return { ...state, watchlist: state.watchlist.filter((s) => s !== symbol) };
}

/** Accept only a well-formed saved state; anything else starts fresh. */
export function isState(x: unknown): x is PortfolioState {
  if (!x || typeof x !== 'object') return false;
  const s = x as PortfolioState;
  return s.v === 1 && typeof s.cash === 'number' && !!s.holdings && typeof s.holdings === 'object' && Array.isArray(s.trades) && Array.isArray(s.watchlist);
}
