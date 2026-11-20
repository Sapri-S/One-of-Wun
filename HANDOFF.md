# HANDOFF.md: Part 1 → Part 2

Part 1 is done: commit **`b35c7aa`** on branch `claude/pensive-newton-q7dfkn`. Create your branch from that branch (that commit or later).
Read `context/SHARED.md` and `context/PART-2.md` first. This file covers **how to use what Part 1 built**.

---

## 1. Run it

```bash
npm ci                 # Node 22+
npm run dev            # http://localhost:4321
npm run build          # static site → dist/ (also writes dist/sw.js)
npm run check          # astro check (TypeScript), must be 0 errors
npm run test:unit      # node --test, pure logic
npm test               # Playwright: builds, serves, runs every e2e test in desktop + mobile
```

Playwright uses `@playwright/test@1.63.0` to match the Chromium already installed in Claude Code cloud sessions. Elsewhere, run `npx playwright install chromium` once.

Lighthouse (target ≥ 95 on every category):
```bash
npm run build && npx astro preview --port 4321 --ignore-lock &
npx -y lighthouse@13.6.0 http://localhost:4321/learn --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new --no-sandbox" --view
```
Part 1 results: `/`, `/grow` and `/es/` all scored **100 / 100 / 100 / 100**, with LCP 0.9s and CLS 0.

---

## 2. How a page is wired (copy this pattern)

Route files are thin. The real page is a **view** inside your feature folder:

```
src/pages/learn.astro      →  <View lang="en" />   (already exists, don't need to touch)
src/pages/es/learn.astro   →  <View lang="es" />   (already exists)
src/features/explorer/LearnView.astro   ← YOU REPLACE THIS (currently a ComingSoon stub)
```

Starter for a view:

```astro
---
import BaseLayout from '../../components/BaseLayout.astro';
import Section from '../../components/Section.astro';
import Card from '../../components/Card.astro';
import Term from '../../components/Term.astro';
import { t, tv, type Lang } from '../../i18n/utils';

interface Props { lang: Lang }
const { lang } = Astro.props;
---
<BaseLayout title={t(lang, 'learn.meta.title')} description={t(lang, 'learn.meta.description')} lang={lang}>
  <Section id="explorer" level={1} title={t(lang, 'learn.title')} badge="education" intro={t(lang, 'learn.lead')}>
    …
  </Section>
  <Section id="costs" tone="sage" title={t(lang, 'learn.costsTitle')} badge="your-choice">
    …
  </Section>
</BaseLayout>
```

- The **first** Section on a page uses `level={1}` (there's no separate hero on Part 2 pages).
- Alternate `tone` between sections: bg → sage → bg → mist.
- Put your feature's interactive component (e.g. `CrashSimulator.astro`) in the same folder and import it into the view.

---

## 3. Shared components (`src/components/`): import, never fork

| Component | Usage | Notes |
|---|---|---|
| `BaseLayout` | `<BaseLayout title description lang>` | Head, skip link, sticky nav (bottom tab bar under 768px), education strip, footer, SW |
| `Section` | `<Section id title badge tone? intro? level?>` | **`badge` required**: `'education' \| 'your-choice' \| 'talk-to-pro'` |
| `SafetyBadge` | `<SafetyBadge kind="talk-to-pro" />` | Use alone inside cards when a card needs its own badge |
| `Card` | `<Card title tone? level?><span slot="top">…</span>…</Card>` | `level` defaults to 3 |
| `Button` | `<Button href? variant="primary\|quiet" type? ariaPressed? id data-*>` | Link if `href`, else `<button>`. 48px tall |
| `Term` | `<Term id="expense-ratio">expense ratio</Term>` | Popover definition. **Build fails if the id isn't in the glossary**, so add new terms first (see §5) |
| `Tabs` | see below | WAI-ARIA tabs, arrow keys, hash deep links |
| `StatusPill` | `<StatusPill status="stop\|wait\|go" label="…" id? />` | JS updates: set class `status status--go` and text of `.status-label` |
| `OnThisPage` | `<OnThisPage items={[{id, label}]} />` | Jump-link chips; use on long pages |
| `Disclaimer` | `<Disclaimer variant="projection" />` | **Required next to every projection** ("Example, not a promise.") |
| `ExternalLink` | `<ExternalLink href org="CFPB">Consumer guides</ExternalLink>` | Same tab, ↗ icon, `rel="noopener noreferrer"`, screen-reader "(opens CFPB website)" |
| `Icon` | `<Icon name="check" size={20} />` | Names: home sprout book practice route lifebuoy external check pause hourglass info close flag chevron-left chevron-right minus plus reset lock arrow-down steps gate hand |
| `ComingSoon` | stub only | Delete once all four Part 2 views are real |

### Tabs (for `/your-path`)
```astro
<Tabs idPrefix="path" label={t(lang, 'path.tabsLabel')} tabs={[
  { id: 'catch-up', label: t(lang, 'path.tabs.catchUp') },
  { id: 'gig', label: t(lang, 'path.tabs.gig') },
  { id: 'first-gen', label: t(lang, 'path.tabs.firstGen') },
  { id: 'banked', label: t(lang, 'path.tabs.banked') },
]}>
  <div slot="catch-up">…</div>
  <div slot="gig">…</div>
  <div slot="first-gen">…</div>
  <div slot="banked">…</div>
</Tabs>
```
`/your-path#gig` opens the Gig tab directly; clicking a tab updates the hash. Don't give any other element on the page an `id` equal to a tab id.

---

## 4. Copy and i18n

- **No hard-coded strings.** Add keys to `src/i18n/en.json` **and** `src/i18n/es.json` under **your namespaces only**: `learn.*`, `practice.*`, `path.*`, `help.*`.
- `t(lang, 'learn.title')` → string, with `{placeholders}`: `t(lang, 'x', { rate: 6 })`.
- `tv<T>(lang, 'learn.cards')` → raw arrays/objects.
- Missing keys **fail the build** (falls back to English first, then throws).
- `localizePath('/help', lang)` → `/es/help` for Spanish. Use it for every internal link.
- `formatMoney(1000, lang)` → `$1,000`.
- Strings a client script needs: pass them in a `data-i18n={JSON.stringify(obj)}` attribute and `JSON.parse` them in the script (see `features/readiness/ReadinessCheck.astro`). **No inline scripts.**
- Spanish is an AI draft; `es.json` has `"_meta": { "reviewed": false }`.
- Existing `common.*` keys you can reuse: `common.reset`, `common.disclaimer.*`, `common.status.*`, `common.badge.*`.

## 5. Glossary

Seeded ids (EN + ES): `401k 401k-match 1099 andon apr bond-fund catch-up-contribution check-casher compound-growth credit-union diversification emergency-fund expense-ratio fdic index-fund ira jidoka kaizen market-drop paper-trading roth-ira secure-2 single-stock social-security`.

Need another? **Append** it to both `src/content/glossary.en.json` and `glossary.es.json` (`{ "term": "…", "def": "…" }`, 6th–8th grade, 1–2 sentences). It appears on `/glossary` automatically. Never edit or remove existing entries.

---

## 6. Rules the build and tests enforce

The e2e harness (`tests/e2e/`) already covers **every route including yours**, in desktop and mobile:
- axe-core WCAG 2.1 AA: 0 violations
- **Production CSP enforced** (copied from `netlify.toml`): any inline `<script>`, `<style>` or `style="…"` attribute fails. Set styles from JS with `el.style.x = …` (allowed) or toggle classes.
- No requests to other origins; no cookies; no `localStorage`/`sessionStorage`
- No horizontal scroll at 320px
- Every `main section.section` has a badge
- No console errors

Add your own interaction tests as **new files** in `tests/e2e/` (e.g. `crash.spec.ts`). Import `test, expect` from `./fixtures` to get the CSP and network guards for free:
```ts
import { test, expect } from './fixtures';
test('crash sim drops to $700 and resets', async ({ page, problems }) => {
  await page.goto('/practice');
  // …
  expect(problems).toEqual([]);
});
```

Motion: use `var(--dur)` and `var(--ease)`. `prefers-reduced-motion` is already globally neutralised for CSS. For JS number animations, check `matchMedia('(prefers-reduced-motion: reduce)')` and jump to the end state.

---

## 7. Decisions Part 1 made (so you don't re-litigate)

- **Astro 7.4.13** (latest stable at build time), not Astro 4.
- **Background** changed from cream `#F7F5F0` to sage-tinted `#F3F6F2`. Tokens in `src/styles/tokens.css` are the source of truth.
- **Mobile nav**: bottom tab bar with 5 items (Grow, Learn, Practice, Your path, Help); Home is the wordmark. The tab labels are 13px; that's the one exception to the 16px minimum, because they're paired with icons.
- **Roadmap demo**: "Not ready yet" puts *You are here* on step 3 (cushion) with steps 7–8 *Paused*; "Ready" puts it on step 6 with steps 7–8 *Open*.
- **Readiness order**: bills not covered → Stop; debt over 15% → Stop; under $1,000 → Wait; else Go. Result links: Stop → `/help`, Wait → `/grow`, Go → `/learn`. **Your `/help` and `/learn` pages are linked from here.**
- **Generations**: +25 years of growth per generation, no new money, shown at 6% by default with a 4/6/8 toggle; bars are linear.
- **Offline**: the service worker precaches every built file automatically; no action needed.
- **Theme**: follows the device's light/dark setting. There's no manual toggle, because that would need storage.

## 8. Known gaps / for the product owner

- Spanish copy needs native-speaker review.
- The wealth-gap figures on `/about` ($332,000 vs $37,000, "2025") come from the PRD and **need a cited source** before launch.
- `astro.config.mjs` → `site` is now `https://one-of-wun-nu.vercel.app` (Vercel project `one-of-wun`, team `aggie-connect`, production branch `main`). Change it if a custom domain is added.
- The Atkinson Hyperlegible font draws zero with a slash (`0`→`Ø`-like). That's deliberate for legibility; flag it if it reads oddly in money amounts.

---

## Part 2 notes

Branch `part2/pages`, built on `d0d4bc9`. Touches only Part 2 files, plus two allowed changes: appended `learn.* practice.* path.* help.*` namespaces in `src/i18n/{en,es}.json`, and deleted the now-unused `src/components/ComingSoon.astro`. Part 1's `common.comingSoon` keys are untouched and can be removed by Part 1.

### What shipped
| Route | Feature | Files |
|---|---|---|
| `/learn` | F6 explorer: 3 cards, risk bar 1–5 (with text), yearly cost per $100 / $1,000 / $10,000 chips, "Good to know", questions to ask, BrokerCheck + Investor.gov checks | `features/explorer/{LearnView,InvestmentExplorer}.astro`, `funds.ts` |
| `/practice` | F7 crash simulator: $1,000 → $700 over 1.5s with an SVG dip (instant with reduced motion), 4-step coaching stepper (Next/Back, focus moves to each step), optional example recovery with "Example, not a promise.", always-visible reset | `features/crash-sim/{PracticeView,CrashSimulator}.astro`, `series.ts` |
| `/your-path` | F8 tabs `#catch-up #gig #first-gen #banked`: story, tick-as-you-read checklist (not saved), words to know, "Try this tool" link per tab | `features/life-stages/{PathView,StagePanel}.astro`, `stages.ts` |
| `/help` | F9 11 resources, 5 category chips, accent-insensitive search, "No matches" state with "Clear search", 10-question FAQ (`<details>`) | `features/resources/{HelpView,ResourceFinder}.astro`, `filter.ts`, `content/resources.json`, `content/faq.{en,es}.json` |

All four have `/es/` versions through the existing route files.

### Tests added
- `tests/e2e/part2.spec.ts`: 11 interaction tests × desktop + mobile (cost chips, full simulator run plus reduced motion and Spanish, tab deep links and arrow keys, search, chips, empty state and clear, external link attributes, no storage after using every tool).
- `tests/unit/part2.test.ts`: cost math and formatting, the 30% series, chart bounds, search normalising and matching.
- Results: `npm test` **70/70**, `npm run test:unit` **20/20**, `npm run check` 0 errors.

### Defaults and decisions
- **Typical yearly costs** (illustrative): index fund 0.05%, bond fund 0.10%, single stock $0 fund fee. **Risk**: bond 2, index 3, stock 5. Costs show cents only when needed (`$0.50`, `$5`).
- **Recovery** is scripted to $1,050 and only appears after the drop. No paper-trading provider is named (Q6); the copy says "a practice account".
- **Catch-up figures**: $8,000 for a 401(k) and $1,100 for an IRA (2026, from SHARED §7 F8), in `life-stages/stages.ts`. The 60–63 super catch-up gets one line with a "Talk to a licensed pro" badge and no number (Q10).
- **First-gen order** matches the Home roadmap: $1,000 cushion → full 401(k) match → debt over 15% APR → 3–6 month cushion → invest more.
- **`resources.json`** adds a `name: {en, es}` field to the spec shape `{ id, org, url, category, desc }`. Each resource has one category.
- **URLs checked on 2026-11-20:** all resolve (200). `ssa.gov` returns 403 to scripts, so it was confirmed in a real browser. `mycreditunion.gov`'s locator redirects, so the final `https://mapping.ncua.gov/` is used.
- **FAQ** says "I'm over 50. Can I still start?" rather than "too late", which is a banned word.
- **Coaching steps** may carry a glossary term (`practice.steps[i].term`) shown under the step. No new glossary keys were needed.
- **Spanish** is an AI draft, like the rest of `es.json` (`reviewed: false`).

### Not verified
- **Lighthouse was not run** on the Part 2 pages: the run was blocked in this environment. Run the command in §1 on `/learn`, `/practice`, `/your-path` and `/help` before launch.
- Spanish needs native-speaker review. Recheck the catch-up limits each year.

### Prop requests
- **`Button` and `hidden`:** `Button` sets `display: inline-flex` globally, which overrides the `hidden` attribute. Suggest adding `.btn[hidden] { display: none; }` to `Button.astro`. Workaround in place: `CrashSimulator.astro` has a scoped `[hidden] { display: none !important; }`.

### Update (Nov 20 2026): mock market + Save page — branch `feature/invest-save`
**Why:** the product owner wants a mock market with real prices and play money (like a trading app, no real money yet), not a scripted crash simulation, plus a demo bank / high-yield savings page.

| Route | What | Files |
|---|---|---|
| `/invest` (was `/practice`) | Mock market: live U.S. prices, $10,000 play money, buy/sell by $ or shares, holdings, P/L, history, watchlist, reset | `src/features/market/{MarketView,MockMarket}.astro`, `portfolio.ts`, `storage.ts`, `api.ts` |
| `/save` (was `/grow`) | Demo bank (mock data in fixed random ranges), high-yield savings comparison + demo "move money", Kaizen calculator | `src/features/save/{SaveView,DemoBank,HighYield}.astro`, `mockBank.ts`, `hys.ts`, `bankStore.ts` |
| `/api/quote`, `/api/search` | Vercel functions that call Finnhub with `FINNHUB_API_KEY` (server-side only), 15s CDN cache, 503 when unavailable | `api/{quote,search,_lib}.ts` |

- **Nav** (`src/i18n/utils.ts` `PAGES`): Home, Save, Learn, Invest, Your path, Help. `/practice` → `/invest` and `/grow` → `/save#calculator` redirect (`vercel.json` + `astro.config.mjs` `redirects`).
- **Part 1 files touched** (owner-approved): `utils.ts` PAGES, `HomeView.astro` tiles, `ReadinessCheck.astro` "wait" link, `KaizenCalculator.astro` (input card no longer `position: sticky`), `common.nav` + `home.start.tiles` strings, `SHARED.md` rules 1 and 4, site map, click budget, F7/F10.
- **Storage:** only `localStorage['wywtb.mockMarket.v1']` (play portfolio). The demo bank is in memory only.
- **Setup needed:** add `FINNHUB_API_KEY` in Vercel (Project → Settings → Environment Variables, Production + Preview). Without it, `/invest` shows "Live prices are unavailable" and trading pauses; everything else works. Local: `vercel dev` (the plain `astro dev` server doesn't run `/api`).
- **Free-tier limits:** Finnhub free has no historical candles, so there is no price-history chart; 60 calls/min shared by all visitors (the 15s cache covers this for normal traffic).
