/** F9 — pure filter logic for the resources directory (unit-tested in tests/unit/filter.test.ts). */

export const CATEGORIES = ['credit', 'banking', 'taxes', 'investing', 'retirement'] as const;
export type Category = (typeof CATEGORIES)[number];

/** Lower-case, strip accents and extra spaces, so "Crédito" matches "credito". */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Does an item pass the category chip and every word of the (already normalized) query? */
export function matches(item: { cat: string; text: string }, category: string, query: string): boolean {
  if (category !== 'all' && item.cat !== category) return false;
  if (!query) return true;
  return query.split(' ').every((word) => item.text.includes(word));
}
