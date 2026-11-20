import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../../src/features/readiness/logic.ts';

test('pending until all answered', () => {
  assert.equal(evaluate({ highInterestDebt: true, hasThousandSaved: null, billsCovered: true }), null);
});
test('bills not covered → stop (bills), even with no debt', () => {
  assert.deepEqual(evaluate({ highInterestDebt: false, hasThousandSaved: true, billsCovered: false }), { status: 'stop', reason: 'bills' });
});
test('debt over 15% → stop (debt)', () => {
  assert.deepEqual(evaluate({ highInterestDebt: true, hasThousandSaved: true, billsCovered: true }), { status: 'stop', reason: 'debt' });
});
test('no $1,000 cushion → wait', () => {
  assert.deepEqual(evaluate({ highInterestDebt: false, hasThousandSaved: false, billsCovered: true }), { status: 'wait', reason: 'buffer' });
});
test('all safe → go', () => {
  assert.deepEqual(evaluate({ highInterestDebt: false, hasThousandSaved: true, billsCovered: true }), { status: 'go', reason: 'ready' });
});
