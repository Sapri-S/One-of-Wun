/** Mock market: browser side of the price API. Only ever calls this site's own /api/* (CSP connect-src 'self'). */

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  time: number;
}

export interface SearchHit {
  symbol: string;
  name: string;
  type: string;
}

export class PricesUnavailable extends Error {}

async function getJson<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { accept: 'application/json' } });
  } catch {
    throw new PricesUnavailable('network');
  }
  if (!res.ok) throw new PricesUnavailable(String(res.status));
  return (await res.json()) as T;
}

export function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return Promise.resolve([]);
  // Sorted so the same set of symbols always makes the same URL, which the CDN can share between visitors.
  const list = [...new Set(symbols)].sort().slice(0, 20);
  return getJson<Quote[]>(`/api/quote?symbols=${encodeURIComponent(list.join(','))}`);
}

export function searchSymbols(q: string): Promise<SearchHit[]> {
  return getJson<SearchHit[]>(`/api/search?q=${encodeURIComponent(q)}`);
}

/** US regular market hours, roughly: Mon–Fri 9:30–16:00 New York time (holidays not counted). */
export function marketOpen(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = get('weekday');
  const mins = Number(get('hour')) * 60 + Number(get('minute'));
  return !['Sat', 'Sun'].includes(day) && mins >= 570 && mins < 960;
}

/** Call `fn` now and every `ms` while the tab is visible; pauses when hidden. Returns a stop function. */
export function poll(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setInterval> | null = null;
  const start = () => {
    if (timer === null) timer = setInterval(fn, ms);
  };
  const stop = () => {
    if (timer !== null) clearInterval(timer);
    timer = null;
  };
  const onVis = () => {
    if (document.hidden) stop();
    else {
      fn();
      start();
    }
  };
  document.addEventListener('visibilitychange', onVis);
  fn();
  if (!document.hidden) start();
  return () => {
    stop();
    document.removeEventListener('visibilitychange', onVis);
  };
}
