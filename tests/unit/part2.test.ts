// Part 2 pure logic: explorer costs, crash-sim series, resource filter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FUNDS, yearlyCost, formatCost } from '../../src/features/explorer/funds.ts';
import { START, BOTTOM, BEFORE, DROP, RECOVERY, pathFor, x, y, VIEW } from '../../src/features/crash-sim/series.ts';
import { matches, normalize } from '../../src/features/resources/filter.ts';

test('index fund at 0.05%: $0.05 / $0.50 / $5 a year on $100 / $1,000 / $10,000', () => {
  assert.equal(yearlyCost(100, 0.0005), 0.05);
  assert.equal(yearlyCost(1000, 0.0005), 0.5);
  assert.equal(yearlyCost(10000, 0.0005), 5);
});

test('cost formatting shows cents only when needed', () => {
  assert.equal(formatCost(0.5, 'en-US'), '$0.50');
  assert.equal(formatCost(5, 'en-US'), '$5');
  assert.equal(formatCost(0, 'en-US'), '$0');
});

test('risk levels are 1–5 and single stocks are the riskiest', () => {
  for (const f of FUNDS) assert.ok(f.risk >= 1 && f.risk <= 5);
  assert.equal(Math.max(...FUNDS.map((f) => f.risk)), FUNDS.find((f) => f.id === 'stock')!.risk);
});

test('crash series: $1,000 → $700 is exactly a 30% drop, segments join up', () => {
  assert.equal(START, 1000);
  assert.equal(BOTTOM, 700);
  assert.equal((START - BOTTOM) / START, 0.3);
  assert.equal(BEFORE.at(-1), DROP[0]);
  assert.equal(DROP.at(-1), RECOVERY[0]);
});

test('chart coordinates stay inside the viewBox', () => {
  for (const v of [...BEFORE, ...DROP, ...RECOVERY]) {
    const py = y(v);
    assert.ok(py >= 0 && py <= VIEW.h, `y(${v}) = ${py}`);
  }
  assert.ok(x(0) >= 0);
  assert.ok(pathFor(DROP, 12).startsWith('M'));
  assert.equal(pathFor(DROP, 12, 0).split('L').length, 2); // first segment only
});

test('normalize strips accents and case', () => {
  assert.equal(normalize('  Crédito  y DEUDAS '), 'credito y deudas');
});

test('filter: category chip and every search word must match', () => {
  const item = { cat: 'taxes', text: normalize('IRS VITA free tax help volunteers') };
  assert.ok(matches(item, 'all', ''));
  assert.ok(matches(item, 'taxes', normalize('free TAX')));
  assert.ok(!matches(item, 'banking', ''));
  assert.ok(!matches(item, 'all', normalize('tax credit union')));
});
