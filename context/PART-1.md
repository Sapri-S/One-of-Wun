# PART 1 brief: Foundation, Home, and the Kaizen calculator

> Read `SHARED.md` in full first. This brief only says what is **yours**, in what order, and how you know you're done.

## Your mission
Build the foundation that Part 2 depends on, **ship it first**, then build the Home page and the `/grow` calculator. Part 2 is blocked until you push the `part1-foundation` tag, so do Phase A fast and well.

## You own (SHARED §9.1)
- Repo scaffold, `astro.config.mjs`, i18n routing, CSP headers (`netlify.toml` + `vercel.json`), service worker, `package.json` scripts
- `src/styles/tokens.css`, `src/styles/global.css`
- `src/components/*`: every shared component in SHARED §6
- `src/i18n/utils.ts`, plus the `common.*`, `home.*` and `grow.*` keys in `src/i18n/{en,es}.json`
- `src/content/glossary.{en,es}.json` (you seed it; Part 2 only adds keys)
- Pages: `index`, `grow`, `glossary`, `about`, `404`, and their `/es/` twins
- Features: `src/features/roadmap/`, `readiness/`, `kaizen/`
- `tests/` harness: `a11y.spec.ts`, `no-network.spec.ts`, `calc.spec.ts`
- `/HANDOFF.md`

**Do not build** anything in `learn`, `practice`, `your-path` or `help` beyond a stub.

---

## Phase A: Foundation → tag `part1-foundation` (Part 2 waits for this)
1. Scaffold Astro 4 + TypeScript (strict), static output. Scripts: `dev`, `build`, `preview`, `check`, `test`.
2. Self-host the Atkinson Hyperlegible font (400 and 700, woff2) in `public/fonts/`.
3. `tokens.css` copied **exactly** from SHARED §5.3. `global.css` covers the reset, type scale (§5.4), focus ring, reduced-motion rule and `.visually-hidden`.
4. i18n: `/` and `/es/` routing, `t(key)` helper, a language toggle that keeps the visitor on the same page in the other language. No storage; the URL is the state.
5. Build every component in SHARED §6 with the exact props listed there. Add a usage example for each to `HANDOFF.md`.
6. `BaseLayout`: skip link, sticky top nav (6 items) that becomes a **bottom tab bar** under 768px, footer (Glossary, About, disclaimer), and a site-wide "Education only — not financial advice" strip.
7. Stub pages for `/learn`, `/practice`, `/your-path` and `/help` (+ `/es/`), each with `BaseLayout` and one `Section` reading "Coming soon — Part 2".
8. Seed the glossary with every term in SHARED §6.4, in EN and ES.
9. Service worker that precaches `/**/*.html`, CSS, JS and fonts, so new Part 2 pages are picked up automatically.
10. CSP headers from SHARED §4.
11. Test harness: Playwright + `@axe-core/playwright` that loops over every route, plus a no-network test that fails on any non-same-origin request.
12. Write `HANDOFF.md`: how to run, component API with examples, glossary keys, i18n namespaces Part 2 may use, known gaps.
13. Commit, tag `part1-foundation`, push both.

## Phase B: Home `/` (F1, F2, F3)
- Hero, then the **8-milestone roadmap** with the "Not ready yet / Ready" toggle (milestone order is ✅ decided, SHARED §7 F1).
- **Readiness check**: 3 yes/no questions with deterministic Stop / Wait / Go logic (SHARED §7 F2), shown in an `aria-live` result, with an Andon "pause" explainer and a "Start over" button.
- Toyota Way trio cards.
- "Start here" tiles linking to all 6 pages (this is what guarantees the 3-click rule).

## Phase C: `/grow` (F4)
- Two sliders with ± steppers: $5–$100/week (default 5) and 10–60 years (default 30).
- `FV = weekly × 52 × ((1+r)^years − 1) / r` at 4%, 6% and 8%. Show "Total you put in".
- Generations: kids = FV × (1+r)^25, grandkids = kids × (1+r)^25. Show 6% by default with a 4/6/8 toggle.
- Inline SVG chart. "Example, not a promise." Unit tests in `calc.spec.ts` for at least 3 known values.

## Phase D: `/glossary`, `/about`, `404`
- Glossary: A–Z list built from the JSON, with anchor links.
- About: mission, a plain privacy promise ("We don't collect anything. No cookies. No tracking."), and the non-advisory disclosure.
- 404: calm wording plus links to all 6 pages.

## Done when
Every box in SHARED §9.3 is checked for your pages, `HANDOFF.md` is current, and the click-budget table in SHARED §2 is still true.

---

## Kickoff prompt (paste into the Part 1 agent)
```
You are the Part 1 builder for the "Where You Want to Be" website.
Read context/README.md, then context/SHARED.md in full, then context/PART-1.md, then context/SKILLS.md.
Install or enable the skills listed for Part 1 in SKILLS.md.
Do Phase A first and push the `part1-foundation` tag before starting Phase B.
Touch only the files Part 1 owns (SHARED.md §9.1). Follow the 3-click rule and the hard rules in SHARED.md §1.
When a decision isn't covered, use the default in SHARED.md §11 and note it in HANDOFF.md.
```
