/**
 * i18n helpers. Used by every page and component.
 * Part 2: you may add keys under learn.*, invest.*, save.*, path.*, help.* in en.json / es.json.
 */
import en from './en.json';
import es from './es.json';
import glossaryEn from '../content/glossary.en.json';
import glossaryEs from '../content/glossary.es.json';

export type Lang = 'en' | 'es';
export const LANGS: Lang[] = ['en', 'es'];

const dicts: Record<Lang, unknown> = { en, es };

export type GlossaryEntry = { term: string; def: string };
const glossaries: Record<Lang, Record<string, GlossaryEntry>> = { en: glossaryEn, es: glossaryEs };

/** Language from a URL: anything under /es is Spanish, everything else English. */
export function getLang(url: URL): Lang {
  return url.pathname === '/es' || url.pathname.startsWith('/es/') ? 'es' : 'en';
}

function lookup(obj: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>(
    (acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined),
    obj,
  );
}

/**
 * Raw value at a dotted key (strings, arrays or objects). Falls back to English.
 * Throws at build time when a key is missing everywhere, so typos never ship.
 */
export function tv<T = unknown>(lang: Lang, key: string): T {
  const v = lookup(dicts[lang], key) ?? lookup(dicts.en, key);
  if (v === undefined) throw new Error(`[i18n] Missing key "${key}"`);
  return v as T;
}

/** Translated string with {placeholder} replacement. */
export function t(lang: Lang, key: string, vars: Record<string, string | number> = {}): string {
  const v = tv<unknown>(lang, key);
  if (typeof v !== 'string') throw new Error(`[i18n] Key "${key}" is not a string`);
  return v.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Path in the given language. localizePath('/save', 'es') → '/es/save'. Hashes are kept. */
export function localizePath(path: string, lang: Lang): string {
  const [p, hash] = path.split('#');
  const clean = stripLang(p || '/');
  const out = lang === 'es' ? (clean === '/' ? '/es/' : `/es${clean}`) : clean;
  return hash ? `${out}#${hash}` : out;
}

/** Remove a leading /es from a path. */
export function stripLang(path: string): string {
  if (path === '/es' || path === '/es/') return '/';
  return path.startsWith('/es/') ? path.slice(3) : path;
}

/** Same page in the other language. */
export function alternatePath(url: URL): { lang: Lang; href: string } {
  const other: Lang = getLang(url) === 'en' ? 'es' : 'en';
  return { lang: other, href: localizePath(url.pathname, other) };
}

export function glossary(lang: Lang): Record<string, GlossaryEntry> {
  return glossaries[lang];
}

export function glossaryEntry(lang: Lang, id: string): GlossaryEntry {
  const e = glossaries[lang][id] ?? glossaries.en[id];
  if (!e) throw new Error(`[glossary] Missing term "${id}". Add it to src/content/glossary.en.json and glossary.es.json.`);
  return e;
}

export const LOCALE: Record<Lang, string> = { en: 'en-US', es: 'es-US' };

export function formatMoney(n: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(n));
}

/** The six main pages, in nav order. Single source for nav, tiles and the 404 page. */
export const PAGES = [
  { key: 'home', path: '/', icon: 'home' },
  { key: 'save', path: '/save', icon: 'sprout' },
  { key: 'learn', path: '/learn', icon: 'book' },
  { key: 'invest', path: '/invest', icon: 'practice' },
  { key: 'path', path: '/your-path', icon: 'route' },
  { key: 'help', path: '/help', icon: 'lifebuoy' },
] as const;

export type PageKey = (typeof PAGES)[number]['key'];
