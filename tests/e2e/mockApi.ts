/**
 * Fixed stand-ins for the /api/* Vercel functions (the Astro preview server used in tests can't run them).
 * Tests can switch the API off to check the "prices unavailable" state.
 */
export const MOCK_QUOTES: Record<string, { price: number; change: number; changePct: number }> = {
  AAPL: { price: 200, change: 2, changePct: 1.01 },
  MSFT: { price: 400, change: -4, changePct: -0.99 },
  AMZN: { price: 180, change: 1.5, changePct: 0.84 },
  NVDA: { price: 120, change: -1.2, changePct: -0.99 },
  TSLA: { price: 250, change: 5, changePct: 2.04 },
  SPY: { price: 500, change: 2.5, changePct: 0.5 },
  VTI: { price: 250, change: 1, changePct: 0.4 },
  KO: { price: 60, change: 0.3, changePct: 0.5 },
};

export const MOCK_SEARCH: Record<string, { symbol: string; name: string; type: string }[]> = {
  coca: [{ symbol: 'KO', name: 'COCA-COLA CO', type: 'Stock' }],
  apple: [{ symbol: 'AAPL', name: 'APPLE INC', type: 'Stock' }],
};

export function mockApiResponse(url: URL, off = false): { status: number; body: unknown } {
  if (off) return { status: 503, body: { error: 'prices_unavailable' } };
  if (url.pathname === '/api/quote') {
    const symbols = (url.searchParams.get('symbols') ?? '').split(',').filter(Boolean);
    return {
      status: 200,
      body: symbols
        .filter((s) => MOCK_QUOTES[s])
        .map((s) => {
          const q = MOCK_QUOTES[s];
          return { symbol: s, ...q, open: q.price - 1, high: q.price + 2, low: q.price - 3, prevClose: q.price - q.change, time: 1795190000 };
        }),
    };
  }
  if (url.pathname === '/api/search') {
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    return { status: 200, body: MOCK_SEARCH[q] ?? [] };
  }
  return { status: 404, body: { error: 'not_found' } };
}
