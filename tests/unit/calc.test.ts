import { test } from 'node:test';
import assert from 'node:assert/strict';
import { futureValue, totalContributed, generations, yearlySeries, clamp } from '../../src/features/kaizen/calc.ts';

const near = (a: number, b: number, tol = 1) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

test('PRD formula: $5/week, 30 years, 6% ≈ $20,555', () => near(futureValue(5, 30, 0.06), 20555.2, 0.5));
test('$100/week, 10 years, 4% ≈ $62,431', () => near(futureValue(100, 10, 0.04), 62431.4, 0.5));
test('$50/week, 40 years, 8% ≈ $673,547', () => near(futureValue(50, 40, 0.08), 673546.9, 0.5));
test('zero rate is plain saving', () => assert.equal(futureValue(10, 5, 0), 2600));
test('total contributed', () => assert.equal(totalContributed(5, 30), 7800));
test('series starts at 0 and ends at FV', () => {
  const s = yearlySeries(5, 30, 0.06);
  assert.equal(s.length, 31);
  assert.equal(s[0], 0);
  near(s[30], futureValue(5, 30, 0.06), 0.001);
});
test('generations grow 25 years each', () => {
  const g = generations(5, 30, 0.06);
  near(g.kids, g.you * Math.pow(1.06, 25), 0.001);
  near(g.grandkids, g.kids * Math.pow(1.06, 25), 0.001);
});
test('clamp snaps to step and range', () => {
  assert.equal(clamp(3, 5, 100, 5), 5);
  assert.equal(clamp(107, 5, 100, 5), 100);
  assert.equal(clamp(12, 5, 100, 5), 10);
});
