/**
 * GET /api/quote?symbols=AAPL,MSFT → Quote[] (real prices from Finnhub; may be delayed).
 * Unknown symbols are left out. 503 when no key is set or Finnhub fails.
 */
import { apiKey, badRequest, cached, finnhub, json, parseSymbols, toQuote, unavailable, type Quote } from './_lib.js';

export async function GET(request: Request): Promise<Response> {
  const symbols = parseSymbols(new URL(request.url).searchParams.get('symbols'));
  if (!symbols) return badRequest();
  const key = apiKey();
  if (!key) return unavailable();
  try {
    const results = await Promise.all(
      symbols.map((s) =>
        cached(`q:${s}`, async () => toQuote(s, (await finnhub('/quote', { symbol: s }, key)) as Record<string, unknown>)),
      ),
    );
    return json(results.filter((q): q is Quote => q !== null));
  } catch {
    return unavailable();
  }
}
