// Mock market, demo bank, high-yield and API input checks: pure logic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState, buy, sell, valuation, START_CASH, isState } from '../../src/features/market/portfolio.ts';
import { generateBank, RANGES, TX_RULES, spendingByCategory, monthTotals, DEMO_BANKS } from '../../src/features/save/mockBank.ts';
import { growth, interest, monthlyInterest, compare } from '../../src/features/save/hys.ts';
import { parseSymbols, parseQuery, toQuote, toHits } from '../../api/_lib.ts';

test('buy by dollars rounds shares down and never overspends', () => {
  const r = buy(initialState(), 'AAPL', 300, { dollars: 1000 }, 1);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.trade.shares, 3.3333);
  assert.equal(r.trade.total, 999.99);
  assert.equal(r.state.cash, START_CASH - 999.99);
});

test('average cost across two buys, partial sell keeps average', () => {
  let s = initialState();
  let r = buy(s, 'KO', 50, { shares: 10 });
  assert.ok(r.ok); s = r.ok ? r.state : s;
  r = buy(s, 'KO', 70, { shares: 10 });
  assert.ok(r.ok); s = r.ok ? r.state : s;
  assert.deepEqual(s.holdings.KO, { shares: 20, cost: 1200 });
  r = sell(s, 'KO', 80, { shares: 5 });
  assert.ok(r.ok); s = r.ok ? r.state : s;
  assert.deepEqual(s.holdings.KO, { shares: 15, cost: 900 }); // still $60 average
  assert.equal(s.cash, START_CASH - 1200 + 400);
});

test('selling everything removes the holding; dollar sell of the full value sells all', () => {
  let s = initialState();
  const r1 = buy(s, 'SPY', 333.33, { dollars: 1000 });
  assert.ok(r1.ok); s = r1.ok ? r1.state : s;
  const value = Math.round(s.holdings.SPY.shares * 333.33 * 100) / 100;
  const r2 = sell(s, 'SPY', 333.33, { dollars: value });
  assert.ok(r2.ok);
  if (r2.ok) assert.equal(r2.state.holdings.SPY, undefined);
});

test('errors: no cash, no shares, bad amount, bad price', () => {
  const s = initialState();
  assert.deepEqual(buy(s, 'A', 10, { dollars: 20000 }), { ok: false, reason: 'cash' });
  assert.deepEqual(sell(s, 'A', 10, { shares: 1 }), { ok: false, reason: 'shares' });
  assert.deepEqual(buy(s, 'A', 10, { shares: 0 }), { ok: false, reason: 'amount' });
  assert.deepEqual(buy(s, 'A', 0, { shares: 1 }), { ok: false, reason: 'price' });
});

test('valuation: profit and loss vs $10,000', () => {
  const r = buy(initialState(), 'NVDA', 100, { shares: 10 });
  assert.ok(r.ok);
  if (!r.ok) return;
  const v = valuation(r.state, { NVDA: 110 });
  assert.equal(v.total, 10100);
  assert.equal(v.pl, 100);
  assert.equal(v.rows[0].pl, 100);
  assert.equal(Math.round(v.rows[0].plPct), 10);
});

test('saved state validation', () => {
  assert.ok(isState(initialState()));
  assert.ok(!isState({ v: 2 }));
  assert.ok(!isState('nope'));
});

test('demo bank: same seed → same data; every value inside its range', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const b = generateBank('maple', seed);
    assert.deepEqual(b, generateBank('maple', seed));
    assert.ok(b.checking >= RANGES.checking[0] && b.checking <= RANGES.checking[1]);
    assert.ok(b.savings >= RANGES.savings[0] && b.savings <= RANGES.savings[1]);
    assert.ok(b.savingsApy >= RANGES.savingsApy[0] && b.savingsApy <= RANGES.savingsApy[1]);
    for (const t of b.transactions) {
      const [, , lo, hi] = TX_RULES[t.category];
      assert.ok(Math.abs(t.amount) >= lo && Math.abs(t.amount) <= hi, `${t.category} ${t.amount}`);
      assert.ok(t.daysAgo >= 0 && t.daysAgo <= 29);
      assert.equal(t.amount > 0, t.category === 'income');
    }
    const m = monthTotals(b.transactions);
    assert.equal(Math.round((m.income - m.spent) * 100), Math.round(m.left * 100));
    const spend = spendingByCategory(b.transactions);
    assert.ok(spend.every((x, i) => i === 0 || spend[i - 1].total >= x.total));
  }
  assert.equal(DEMO_BANKS.every((d) => d.name.includes('Demo')), true);
});

test('high-yield: APY is exact after one year; monthly and compare agree', () => {
  assert.equal(interest(10000, 0.04, 1), 400);
  assert.equal(growth(1000, 0.05, 10), 1628.89);
  assert.equal(monthlyInterest(12000, 0.04), 39.28); // 12,000 × (1.04^(1/12) − 1)
  const rows = compare(1000, 0.0001, 0.04);
  assert.deepEqual(rows.map((r) => r.years), [1, 5, 10]);
  assert.equal(rows[0].extra, Math.round((40 - 0.1) * 100) / 100);
});

test('API input checks', () => {
  assert.deepEqual(parseSymbols('aapl, MSFT,msft'), ['AAPL', 'MSFT']);
  assert.equal(parseSymbols(''), null);
  assert.equal(parseSymbols('AAPL;DROP'), null);
  assert.equal(parseSymbols(Array.from({ length: 21 }, (_, i) => 'X' + String.fromCharCode(65 + i)).join(',')), null);
  assert.equal(parseQuery('coca cola'), 'coca cola');
  assert.equal(parseQuery('<script>'), null);
  assert.equal(parseQuery(''), null);
  assert.equal(toQuote('ZZZZ', { c: 0, pc: 0 }), null);
  assert.equal(toQuote('AAPL', { c: 200, d: 2, dp: 1, h: 0, l: 0, o: 0, pc: 198, t: 1 })?.price, 200);
  assert.deepEqual(
    toHits({ result: [{ symbol: 'KO', description: 'COCA-COLA CO', type: 'Common Stock' }, { symbol: 'KO.MX', description: 'x', type: 'Common Stock' }, { symbol: 'X', type: 'Crypto' }] }),
    [{ symbol: 'KO', name: 'COCA-COLA CO', type: 'Stock' }, { symbol: 'KO.MX', name: 'x', type: 'Stock' }],
  );
});
