/** GET /api/search?q=apple → SearchHit[] (US stocks and ETFs, top 10). 503 when no key is set or Finnhub fails. */
import { apiKey, badRequest, finnhub, json, parseQuery, toHits, unavailable } from './_lib.js';

export async function GET(request: Request): Promise<Response> {
  const q = parseQuery(new URL(request.url).searchParams.get('q'));
  if (!q) return badRequest();
  const key = apiKey();
  if (!key) return unavailable();
  try {
    return json(toHits((await finnhub('/search', { q, exchange: 'US' }, key)) as Parameters<typeof toHits>[0]));
  } catch {
    return unavailable();
  }
}
