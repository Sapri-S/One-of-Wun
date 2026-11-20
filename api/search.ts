/** GET /api/search?q=apple → SearchHit[] (US stocks and ETFs, top 10). 503 when no key is set or Finnhub fails. */
import { apiKey, badRequest, cached, finnhub, json, parseQuery, toHits, unavailable } from './_lib.js';

export async function GET(request: Request): Promise<Response> {
  const q = parseQuery(new URL(request.url).searchParams.get('q'));
  if (!q) return badRequest();
  const key = apiKey();
  if (!key) return unavailable();
  try {
    const hits = await cached(`s:${q.toLowerCase()}`, async () =>
      toHits((await finnhub('/search', { q, exchange: 'US' }, key)) as Parameters<typeof toHits>[0]),
    );
    return json(hits);
  } catch {
    return unavailable();
  }
}
