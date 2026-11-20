/**
 * Shared helpers for the price API (Vercel functions in /api). Files starting with "_" are not routes.
 * The Finnhub key stays on the server: the browser only ever calls this site's own /api/* (CSP connect-src 'self').
 */

export const FINNHUB = 'https://finnhub.io/api/v1';
export const MAX_SYMBOLS = 20;
const SYMBOL_RE = /^[A-Z][A-Z.\-]{0,9}$/;

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  /** Unix seconds of the last trade. */
  time: number;
}

export interface SearchHit {
  symbol: string;
  name: string;
  type: string;
}

/** Parse "aapl, MSFT,msft" → ["AAPL", "MSFT"]. Returns null if anything is invalid or there are too many. */
export function parseSymbols(raw: string | null): string[] | null {
  if (!raw) return null;
  const list = [...new Set(raw.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean))];
  if (list.length === 0 || list.length > MAX_SYMBOLS) return null;
  return list.every((s) => SYMBOL_RE.test(s)) ? list : null;
}

/** Search text: letters, digits, spaces, dots and dashes, 1–40 chars. */
export function parseQuery(raw: string | null): string | null {
  const q = (raw ?? '').trim();
  return q.length >= 1 && q.length <= 40 && /^[\p{L}\p{N} .\-&]+$/u.test(q) ? q : null;
}

/** Finnhub /quote → our shape. Finnhub returns all zeros for unknown symbols. */
export function toQuote(symbol: string, r: Record<string, unknown>): Quote | null {
  const n = (k: string) => (typeof r[k] === 'number' ? (r[k] as number) : 0);
  if (!n('c') && !n('pc')) return null;
  return {
    symbol,
    price: n('c'),
    change: n('d'),
    changePct: n('dp'),
    open: n('o'),
    high: n('h'),
    low: n('l'),
    prevClose: n('pc'),
    time: n('t'),
  };
}

/** Finnhub /search → US common stocks and ETFs only, top 10. */
export function toHits(r: { result?: { symbol?: string; description?: string; type?: string }[] }): SearchHit[] {
  return (r.result ?? [])
    .filter((x) => x.symbol && SYMBOL_RE.test(x.symbol) && (x.type === 'Common Stock' || x.type === 'ETP'))
    .slice(0, 10)
    .map((x) => ({ symbol: x.symbol!, name: x.description ?? x.symbol!, type: x.type === 'ETP' ? 'ETF' : 'Stock' }));
}

export function json(body: unknown, status = 200, cache = true): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache && status === 200 ? 'public, s-maxage=15, stale-while-revalidate=60' : 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

export const unavailable = () => json({ error: 'prices_unavailable' }, 503, false);
export const badRequest = () => json({ error: 'bad_request' }, 400, false);

export function apiKey(): string | null {
  const k = process.env.FINNHUB_API_KEY;
  return k && k.trim() ? k.trim() : null;
}

export async function finnhub(path: string, params: Record<string, string>, key: string): Promise<unknown> {
  const url = new URL(FINNHUB + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { 'X-Finnhub-Token': key }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`finnhub ${res.status}`);
  return res.json();
}
