# HANDOFF.md: Part 1 → Part 2

Part 1 is done: start from the latest commit (foundation was **`b35c7aa`**; the first-visit UX rework came after it) on branch `claude/pensive-newton-q7dfkn`. Create your branch from that branch (that commit or later).
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
src/features/explorer/LearnView.astro   ← the real page (Part 2)
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
| `HowItWorks` | `<HowItWorks steps={tv<string[]>(lang, 'learn.how')} />` | **Required at the top of every tool.** 3 verb-first steps, ≤ 6 words each |
| `Icon` | `<Icon name="check" size={20} />` | Names: home sprout book practice route lifebuoy external check pause hourglass info close flag chevron-left chevron-right minus plus reset lock arrow-down steps gate hand |

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
- **Nav**: plain task names (`common.nav.*`). At ≥ 1280px there's a top bar with 6 links (the logo is Home). Below that, a bottom tab bar with 6 icons and short labels (`common.navShort.*`). The 13px tab labels are the one exception to the 16px minimum, because they're paired with icons.
- **Home** opens with "What would you like to do today?" and 4 task cards. The readiness check moved to **`/next-step`** and asks one question at a time.
- **Roadmap demo**: "Not ready yet" puts *You are here* on step 3 (cushion) with steps 7–8 *Paused*; "Ready" puts it on step 6 with steps 7–8 *Open*.
- **Readiness order**: bills not covered → Stop; debt over 15% → Stop; under $1,000 → Wait; else Go. Result buttons: Stop → `/help`, Wait → `/grow`, Go → `/learn`. **Your `/help` and `/learn` pages are linked from here and from the Home task cards.**
- **Generations**: +25 years of growth per generation, no new money, shown at 6% by default with a 4/6/8 toggle; bars are linear.
- **Offline**: the service worker precaches every built file automatically; no action needed.
- **Theme**: follows the device's light/dark setting. There's no manual toggle, because that would need storage.

## 8. Known gaps / for the product owner

- Spanish copy needs native-speaker review.
- The wealth-gap figures on `/about` ($332,000 vs $37,000, "2025") come from the PRD and **need a cited source** before launch.
- `astro.config.mjs` → `site` is a placeholder (`whereyouwanttobe.example`). Set the real domain before deploying.
- The Atkinson Hyperlegible font draws zero with a slash (`0`→`Ø`-like). That's deliberate for legibility; flag it if it reads oddly in money amounts.

---

## Part 2 notes

**Status: ✅ shipped** (built in the same session as Part 1, on the same branch). All four routes are real pages in EN and ES. `ComingSoon.astro` has been deleted.

| Route | File(s) | What it does |
|---|---|---|
| `/learn` | `features/explorer/LearnView.astro` | 3 cards (Index funds 3/5, Single stocks 5/5, Bond funds 2/5), $100 / $1,000 / $10,000 chips with costs shown in dollars, a "Small fees add up" box (1% vs 0.05%), and a "Before you invest" checklist with BrokerCheck |
| `/practice` | `features/crash-sim/CrashSimulator.astro`, `PracticeView.astro` | $1,000 → "Simulate a 30% market drop" → $700 (1.5s, instant with reduced motion), 4-step coaching (Back/Next), an illustrative recovery to $1,050 with "Example, not a promise", and an always-visible Reset |
| `/your-path` | `features/life-stages/PathView.astro` | Tabs `#catch-up` `#gig` `#first-gen` `#banked`. Each has a story, numbered steps, "Numbers to know", terms and a "Try this next" button |
| `/help` | `features/resources/HelpView.astro`, `content/resources.json`, `content/faq.{en,es}.json` | Topic chips plus search (accent-insensitive, both languages), "no matches" state with Clear search, 11 free resources and a 9-question FAQ. `/help#banking` (or any category id) opens with that topic chosen |

Defaults used:
- **Risk scores:** index 3, stocks 5, bonds 2. **Typical fees:** 0.05% for index and bond funds; $0 yearly fund fee for single stocks, with the note "the real cost is risk".
- **Recovery example:** ends at $1,050. It's scripted and illustrative, and labeled "Example, not a promise".
- **No provider named** for practice accounts ("Some investing apps offer one for free").
- **Catch-up figures:** $8,000 extra for a 401(k) and $1,100 extra for an IRA (2026). Ages 60–63 get one line with no number and a pointer to a licensed pro.
- **Glossary additions:** `overdraft`, `active-fund`.

Launch checks still open:
- **Verify every URL in `resources.json`** and the inline links (IRS VITA, SSA, BrokerCheck). Outbound network was blocked in the build session, so none were opened. Stable homepage-level URLs were used where possible.
- **Spanish copy** for these four pages is an AI draft too.

Tests: `tests/e2e/part2.spec.ts` covers the chips, crash sim (animated and reduced-motion), tabs (click, arrow keys, hash), help filter/search/empty state/FAQ, outbound-link rules, and the Spanish pages. Lighthouse: `/learn`, `/practice`, `/your-path` and `/help` all scored 100/100/100/100.
