# SHARED.md — "Where You Want to Be" website (master spec)

> **Read this whole file before writing any code.** It is the single source of truth for both builders.
> Source: *Catch Up Sprint Milestone Path PRD v1* (SymStudio, Nov 20 2026).
> The work is split into **Part 1** and **Part 2**, built by different AI agents. Section 9 is the contract between them. If something here conflicts with your instincts, this file wins. If something is unclear, check **Section 11 (Open questions)** and use the stated default.

---

## 1. What we are building

A **calm, free, educational marketing website** for the *Where You Want to Be* financial-empowerment program. It helps first-generation, gig, unbanked and late-career earners see **what to do next with their money, in what order, without shame**.

- It is **not** a fintech app. No accounts, no logins, no real money, no bank links, no product recommendations.
- Everything interactive runs **in the browser only** with **synthetic/demo numbers**. Nothing a visitor types is saved or sent anywhere.
- Guiding ideas (Toyota Way, explained in plain words on the site):
  - **Kaizen** — tiny steps add up ($5/week counts).
  - **Jidoka** — "readiness gates": don't move to the next step until the current one is safe.
  - **Andon** — a judgment-free "pause" button: life happens, pausing is allowed and normal.

### Who it's for (personas — use them in copy and demos)

| Persona | Age / work | Main worry | What the site gives them |
|---|---|---|---|
| **Ayanna Adebayo** | 24, first-gen grad, clinical data coordinator | 24.9% credit card debt vs. 401(k) match | Clear rule: pay off debt >15% APR before investing |
| **Tariq Al-Mansoor** | 31, gig driver & caterer | Irregular income, fear of crashes | $5/week Kaizen steps + practice crash simulator |
| **Guadalupe Tenorio** | 38, home health aide & caregiver | Check-cashing fees, distrust of banks | Bilingual path to a fee-free FDIC account + $1,000 buffer |
| **Sunita Deshmukh** | 58, community services office manager | "Too late after 50" | Catch-Up Sprint: SECURE 2.0 extra limits, framed forward from "Day 1" |

### Hard rules (from the PRD — never break these)

1. **Non-advisory.** No ticker symbols, no named funds/brokers as recommendations, no affiliate links, no sponsored ranking.
2. **Every content section and every interactive module shows a safety badge** (see §6.6) and the line *"Education only — not financial advice."*
3. **Every projection shows "Example, not a promise."**
4. **Zero tracking.** No analytics scripts, no cookies, no pixels, no third-party fonts/CDNs at runtime, no `localStorage`/`sessionStorage` for user numbers.
5. **Plain language: 6th–8th grade reading level.** Every financial term on first use is a tap-to-define term (§6.4).
6. **No shame framing.** Never show "missed years," "you're behind," "lost money." Always frame forward ("from Day 1").
7. **No gamification.** No streaks, points, confetti, leaderboards, badges-as-rewards, countdown urgency.
8. **Mobile-first, WCAG 2.1 AA.**

---

## 2. The 3-click rule (navigation law)

**Any piece of content or any interactive tool on the site must be reachable in 3 clicks or fewer from the home page — and in 2 or fewer from any page via the top nav.**

How we guarantee it:

- **Flat information architecture: max depth = 2** (Home → Page → in-page section). No sub-sub-pages.
- **Top nav is always visible** (sticky) with ≤ 6 items + language toggle. On mobile it becomes a bottom tab bar (thumb reach) — *not* a hidden hamburger maze.
- **Home page has one "Start here" tile per page** (direct links — 1 click).
- Long pages get an **in-page "On this page" chip row** at the top that jump-links to each section (click 2).
- Tools open **inline** (no modals that lead to more modals). Popovers (jargon) are the only overlay type, and they close with Esc / tap-outside / ✕.
- Every interactive tool has a **visible "Reset"** — never a dead end.
- **Click budget table** — every new page/feature must be added here with its click path. If it's > 3, redesign it.

| Destination | Click path from Home | Clicks |
|---|---|---|
| Roadmap + demo toggle | Home hero (already visible) → toggle | 1 |
| Readiness check | Home → "Check your readiness" (scrolls inline) → answer | 1–2 |
| Kaizen calculator | Nav "Grow" → slider | 2 |
| Investment explorer | Nav "Learn" → card | 2 |
| Crash simulator | Nav "Practice" → "Simulate 30% drop" | 2 |
| Persona / life stage | Nav "Your path" → persona tab | 2 |
| Catch-Up Sprint | Nav "Your path" → "50+ Catch-Up" tab | 2 |
| A specific public resource | Nav "Help" → category chip → link | 3 |
| Jargon definition | Tap any underlined term | 1 |
| Spanish version of current page | Language toggle | 1 |

---

## 3. Site map (pages & routes)

All routes have an English and Spanish version: `/…` and `/es/…`.

| # | Route | Nav label (EN / ES) | Contains | Owner |
|---|---|---|---|---|
| 1 | `/` | Home / Inicio | Hero, 8-milestone roadmap with demo toggle, Readiness card, Toyota-Way trio (Kaizen/Jidoka/Andon), "Start here" tiles | **Part 1** |
| 2 | `/grow` | Grow / Crecer | Kaizen Generational Calculator | **Part 1** |
| 3 | `/learn` | Learn / Aprender | Plain-Language Investment Explorer (Index funds, Single stocks, Bonds) | **Part 2** |
| 4 | `/practice` | Practice / Practicar | Paper-trading preview + 30% Crash Simulator | **Part 2** |
| 5 | `/your-path` | Your path / Tu camino | Life Stages hub: tabs for Catch-Up Sprint (50+), Gig Kaizen, First-Gen, Unbanked→Banked | **Part 2** |
| 6 | `/help` | Help / Ayuda | Trusted public resources directory + FAQ | **Part 2** |
| — | `/glossary` | (footer link) | Full jargon lexicon list, A–Z | **Part 1** |
| — | `/about` | (footer link) | Mission, privacy promise ("we collect nothing"), disclosures | **Part 1** |
| — | `404` | — | Calm "this page moved" + links to all 6 pages | **Part 1** |

---

## 4. Tech stack (decided)

- **Astro 4 (static output)** + **TypeScript** + **plain CSS with custom properties** (no Tailwind, no UI kit).
  - Why: ships zero JS by default → Lighthouse ≥ 95, LCP < 1.2s, perfect for a static multi-page site deployable to Vercel/Netlify.
- Interactive pieces are **Astro islands written in vanilla TS** (`<script>` in `.astro` components). **No React/Vue/Svelte.** Keep each island < 10 KB gzipped.
- **No runtime third-party requests.** Fonts self-hosted (`/public/fonts`). No external images.
- Charts: hand-rolled inline **SVG** (no chart libraries).
- i18n: content in JSON dictionaries (`src/i18n/en.json`, `src/i18n/es.json`); routes duplicated via Astro's i18n routing.
- Offline: a small service worker caches pages + calculators (Part 1 sets it up; Part 2 pages are picked up automatically by the precache glob).
- Deploy: static `dist/`, with strict **CSP headers** in `netlify.toml` / `vercel.json` (`default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'`).
- Package manager: **npm**. Node 20+.

---

## 5. UI direction — "Calm, smooth, obvious"

### 5.1 Feeling
A quiet, sunlit room. Soft paper background, sage-green primary, mist blue accents, generous whitespace, one idea per screen-height. Nothing blinks, nothing shouts. Every action is **a big, clearly labeled button that says exactly what it does** ("Show me the 30% drop", not "Go").

### 5.2 Design principles
1. **One primary action per section.** One filled button; everything else is a quiet text/outline button.
2. **Obvious > clever.** Labels are verbs in plain words. Icons always paired with text.
3. **Show state plainly.** Active milestone, current tab, readiness light — use color **and** text **and** an icon (never color alone).
4. **Soft motion only.** 200–300 ms ease-out fades/slides. No bounce, no parallax, no auto-play carousels. Respect `prefers-reduced-motion` (turn motion off, keep instant state changes).
5. **Big tap targets.** Min 48×48 px. Sliders have a 28 px thumb.
6. **Breathing room.** Max text width 65ch. Section padding ≥ 64 px desktop / 40 px mobile.
7. **Forward framing in visuals.** Progress flows left→right, toward "Where you want to be." No red "loss" numbers except inside the crash simulator, and even there use the muted clay tone.

### 5.3 Color tokens (all contrast-checked for WCAG AA)

```css
:root {
  /* surfaces */
  --bg:            #F7F5F0;  /* warm paper */
  --surface:       #FFFFFF;
  --surface-sage:  #E6EEE8;  /* soft section band */
  --surface-mist:  #E5EDF3;  /* alternate band */
  --border:        #DCE3DE;

  /* text */
  --ink:           #22302B;  /* 12.6:1 on bg */
  --ink-soft:      #4A5A54;  /* 6.7:1  */
  --ink-muted:     #5F6E68;  /* 4.9:1 — smallest allowed body color */

  /* brand */
  --primary:       #2F6B5A;  /* sage-teal; white text 6.2:1 */
  --primary-hover: #245548;
  --accent:        #35607E;  /* mist blue for links/secondary, 6.2:1 */
  --focus:         #3B7FB0;  /* 3px focus ring, 4:1 vs bg */

  /* readiness / status — muted, never neon */
  --stop-ink:  #8A3B2E;  --stop-bg:  #F6E4DF;  /* "Pause & fix first" (clay)  */
  --wait-ink:  #7A5410;  --wait-bg:  #F7EDD6;  /* "Build your buffer" (honey) */
  --go-ink:    #2D6A45;  --go-bg:    #E2F0E6;  /* "Ready to learn investing" (sage) */

  /* shape & motion */
  --radius-sm: 10px; --radius: 16px; --radius-lg: 24px;
  --shadow: 0 1px 2px rgb(34 48 43 / .06), 0 6px 24px rgb(34 48 43 / .06);
  --ease: cubic-bezier(.2,.7,.2,1); --dur: 240ms;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px; --space-9: 96px;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #141B19; --surface: #1C2522; --surface-sage: #1F2B27; --surface-mist: #1E2830;
    --border: #2C3934; --ink: #E8EEEA; --ink-soft: #C3CFC9; --ink-muted: #A9B8B1;
    --primary: #7CC4A9; --primary-hover: #95D3BB; --accent: #8FB9D6; --focus: #8FB9D6;
    --stop-ink: #F0B4A8; --stop-bg: #3A2420; --wait-ink: #EBCB8B; --wait-bg: #3A3020;
    --go-ink: #9BD3AE; --go-bg: #1F3529;
  }
}
/* Button text on --primary in dark mode = #0F1A16 (8.75:1) */
```

### 5.4 Typography
- **Font:** "Atkinson Hyperlegible" (designed for low-vision readability), self-hosted, weights 400 & 700. Fallback: `system-ui, sans-serif`.
- Scale (mobile → desktop, use `clamp()`): body 18px; small 16px (never smaller); h3 22→24; h2 28→36; h1 34→52. Line-height 1.6 body, 1.2 headings.
- Numbers in calculators use `font-variant-numeric: tabular-nums`.

### 5.5 Layout
- Mobile-first. Breakpoints: `sm 480`, `md 768`, `lg 1100`. Container max 1120px, 16px side gutter on mobile, 24px tablet+.
- Sections alternate `--bg` / `--surface-sage` / `--bg` / `--surface-mist` bands for calm rhythm.
- No horizontal page scroll at 320px. The 8-milestone roadmap is the only horizontal scroller (scroll-snap, with visible "‹ ›" buttons and keyboard support).

---

## 6. Shared components (built in Part 1, used by Part 2)

All live in `src/components/`. Part 2 **imports** these and **must not fork or restyle** them. If Part 2 needs a change, add an optional prop and note it in `HANDOFF.md`.

| Component | Props (TS) | Notes |
|---|---|---|
| `BaseLayout.astro` | `title: string; description: string; lang: 'en'\|'es'` | `<head>`, skip-link, header nav, footer, disclaimer strip, SW registration |
| `Section.astro` | `id: string; tone?: 'bg'\|'sage'\|'mist'; title: string; badge: BadgeKind; intro?: string` | Every content section uses this. `badge` is **required** (enforces rule #2) |
| `SafetyBadge.astro` | `kind: 'education'\|'your-choice'\|'talk-to-pro'` | See §6.6 |
| `Term.astro` | `id: string` (slot = visible text) | Tap-to-define jargon popover. Looks up `src/content/glossary.{lang}.json` |
| `Button.astro` | `variant?: 'primary'\|'quiet'; href?: string; type?: 'button'; ariaPressed?: boolean` | 48px min height |
| `Tabs.astro` | `tabs: {id:string;label:string}[]; idPrefix: string` | WAI-ARIA tabs pattern, arrow-key nav, URL hash sync (`#tab-id`) for 1-click deep links |
| `Card.astro` | `title: string; tone?: 'plain'\|'sage'\|'mist'` | |
| `StatusPill.astro` | `status: 'stop'\|'wait'\|'go'; label: string` | color + icon + text |
| `OnThisPage.astro` | `items: {id:string;label:string}[]` | chip row of jump links |
| `Disclaimer.astro` | `variant: 'education'\|'projection'` | "Education only — not financial advice." / "Example, not a promise." |
| `ExternalLink.astro` | `href: string; org: string` | Opens same tab, shows ↗ icon + "(opens {org} website)", `rel="noopener noreferrer"` |

### 6.4 Jargon terms
- Underlined with a dotted line in `--accent`; tap/click/Enter opens a small popover: **term**, 1–2 sentence plain definition (≤ 8th grade), and "Close".
- Popover is `role="dialog"` non-modal, `aria-describedby` linked, closes on Esc / outside tap. Focus returns to the term.
- Glossary data shape (`src/content/glossary.en.json`, same keys in `.es.json`):
  ```json
  { "apr": { "term": "APR", "def": "The yearly cost of borrowing money, shown as a percent. A 24.9% APR means about $249 a year in interest for every $1,000 you owe." } }
  ```
- Minimum term set (Part 1 seeds; Part 2 adds what it needs): `apr, index-fund, single-stock, bond-fund, expense-ratio, diversification, 401k, 401k-match, roth-ira, ira, fdic, emergency-fund, compound-growth, catch-up-contribution, secure-2, paper-trading, market-drop, social-security, check-casher, credit-union, 1099, kaizen, jidoka, andon`.

### 6.6 Safety badges (FR-08)
| kind | Label EN | Label ES | Use when |
|---|---|---|---|
| `education` | Education | Educación | Explaining a concept (default) |
| `your-choice` | Your choice | Tu decisión | Showing options the visitor decides between |
| `talk-to-pro` | Talk to a licensed pro | Habla con un profesional | Taxes, retirement accounts, debt negotiation — link to FINRA BrokerCheck / VITA |

---

## 7. Feature specs

### PART 1 features

**F1 — Hero & 8-Milestone Roadmap (FR-01, US-01, P0)** — `/`
- Headline idea: "Get to where you want to be — one calm step at a time." Sub: free, no sign-up, nothing saved.
- Demo switcher (segmented control, 2 options, `aria-pressed`): **"Not ready yet"** (synthetic: $2,400 card debt at 24.9% APR, $300 saved) vs **"Ready"** (no high-interest debt, $1,000 buffer).
- 8 milestones, horizontal path (vertical list on < 480px). **Default milestone list (confirm in §11 Q2):**
  1. Cover the basics (rent, food, utilities, a simple budget)
  2. Open a fee-free FDIC-insured or NCUA-insured account
  3. Save a $1,000 starter buffer
  4. Get any employer 401(k) match ("free money")
  5. Pay off high-interest debt (over 15% APR)
  6. Grow the buffer to 3–6 months of costs
  7. Invest for retirement (IRA / more 401(k))
  8. Invest in a regular (taxable) account
- Switching profile animates (240ms) the "You are here" marker and updates the readiness light. "Not ready yet" → marker on step 5 area with Red light + Education badge + plain explanation: *"Debt over 15% grows faster than investments usually do. Paying it off first is like earning a guaranteed 24.9%."*
- Each milestone is a button; clicking shows a 2–3 sentence explanation panel below (inline, no modal).

**F2 — Readiness Check (FR-02, P0)** — `/` (section `#readiness`)
- 3 yes/no questions, big toggle buttons, one per row:
  1. "Do you have any debt over 15% APR?" (credit cards, payday, title loans)
  2. "Do you have at least $1,000 saved for emergencies?"
  3. "Are your basic bills covered each month?" *(default third question — confirm §11 Q2)*
- Deterministic output, evaluated in order:
  - Q3 = No **or** Q1 = Yes → **Stop** (clay): "Pause and fix this first" + what to do
  - Q2 = No → **Wait** (honey): "Build your buffer"
  - else → **Go** (sage): "Ready to learn about investing"
- Result appears in an `aria-live="polite"` region. Includes an **Andon** "Pause button" explainer: *"Life happened? Pausing is part of the plan."*
- Nothing is stored. "Start over" button resets.

**F3 — Toyota Way trio** — `/`: three calm cards (Kaizen / Jidoka / Andon), icon + 2 sentences each.

**F4 — Kaizen Generational Calculator (FR-04, US-02, P0)** — `/grow`
- Two sliders (`<input type="range">` + visible number + ± stepper buttons for motor accessibility):
  - Weekly amount: **$5 – $100**, step $5, default **$5**.
  - Years: **10 – 60**, step 1, default **30**.
- Formula (from PRD): `FV = weekly × 52 × ((1 + r)^years − 1) / r` for r = 4%, 6%, 8%. Show all three as a calm 3-column result + a simple SVG line chart.
- **Generations tiers ("You", "Your kids", "Your grandkids")** — default interpretation (confirm §11 Q3): each tier is a further 25 years of growth on the prior balance **with no new contributions**: `kids = FV × (1+r)^25`, `grandkids = kids × (1+r)^25`. Show at 6% by default, with a toggle for 4/6/8.
- Always show: *"Example, not a promise."* + "Total you put in: $X" next to the projection, so growth is honest.
- Rounded to whole dollars, `Intl.NumberFormat(lang)`.

**F5 — Shared foundation** — everything in §4–§6, `/glossary`, `/about`, `404`, service worker, CSP headers, i18n plumbing, and `HANDOFF.md`.

### PART 2 features

**F6 — Plain-Language Investment Explorer (FR-03 content, US-03, P0)** — `/learn`
- 3 side-by-side cards (stack on mobile): **Index funds**, **Single stocks**, **Bond funds**.
- Each: one-line plain description, **risk bar 1–5** (5 segments, labeled "Risk: 2 of 5" in text), **typical yearly cost per $1,000** in dollars (e.g., expense ratio 0.05% → "$0.50 per $1,000 a year"), "Good to know" bullets, Education badge.
- Toggle "Show cost for $___" with preset chips ($100 / $1,000 / $10,000) — no free-text input needed.
- Jargon terms wrapped in `<Term>`. **No tickers, no fund names, no brokers.**

**F7 — Paper Trading & Crash Simulator (FR-05, US-05, P1)** — `/practice`
- Practice portfolio card: starts at **$1,000** (synthetic).
- Primary button **"Simulate a 30% market drop"** → scripted animation (≈ 1.5s, number counts down $1,000 → $700, SVG line dips). Reduced-motion: jump instantly.
- Then a calm 3–4 step coaching stepper ("Next" buttons): (1) "Drops like this have happened before — and markets have recovered over time, though not always quickly." (2) "Selling now locks in the drop." (3) "Diversification spreads risk." (4) "Only invest money you won't need for 5+ years."
- Optional "Show a recovery" button (scripted, illustrative only, with "Example, not a promise").
- **"Reset practice portfolio"** always visible.
- Do **not** name a paper-trading provider unless §11 Q6 says so.

**F8 — Life Stages & Persona Explorer (FR-06, US-04, P1)** — `/your-path`
- `Tabs` with 4 tabs; each deep-linkable by hash:
  - `#catch-up` — **Catch-Up Sprint (50+)** — Sunita. SECURE 2.0: extra **$8,000** in 401(k), extra **$1,100** in IRA (age 50+, 2026). Starts at "Day 1" — **no missed-years math**. Includes non-contribution levers: paying off debt, Social Security timing (claiming later = bigger monthly check), keeping an emergency fund (mitigates over-contribution risk). Badge: Talk to a licensed pro.
  - `#gig` — **Gig Kaizen** — Tariq. Variable-income ladder: "$5/week in slow weeks, more in good weeks," buffer-first, 1099 tax set-aside tip + IRS VITA link.
  - `#first-gen` — **First-Gen** — Ayanna. Debt-vs-match order, links back to Home roadmap & readiness.
  - `#banked` — **Unbanked → Banked** — Guadalupe. Steps from check-casher to fee-free FDIC/NCUA account; what FDIC insurance means; how to spot hidden fees.
- Each tab: short story, 3–5 step checklist (visual only, not saved), "Try this tool" link to the relevant Part 1/2 tool (keeps 3-click rule).

**F9 — Trusted Resources & FAQ (FR-07, P1)** — `/help`
- Category chips (filter, client-side): Credit & debt · Banking · Taxes · Investing safely · Retirement.
- A simple search box filtering the list client-side (no network).
- Resource card: org name, 1-line what it helps with, "Free" tag, `ExternalLink`.
- Minimum list: CFPB (consumerfinance.gov), FINRA BrokerCheck (brokercheck.finra.org), IRS VITA (irs.gov/vita), Investor.gov (SEC), FDIC BankFind (banks.data.fdic.gov / fdic.gov), NCUA credit union locator (mycreditunion.gov), NFCC nonprofit credit counseling (nfcc.org), SSA retirement estimator (ssa.gov). Store in `src/content/resources.json` with `{ id, org, url, category, desc: {en, es} }`. **Verify every URL resolves before shipping.**
- FAQ: native `<details>/<summary>` accordion, 8–12 questions (e.g., "Is this financial advice?" "Do you save my numbers?" "Is it too late at 50+?").

---

## 8. Content & copy rules

- Reading level 6th–8th grade (check with Hemingway / `text-readability`; target Flesch-Kincaid ≤ 8).
- Sentences ≤ 20 words. Second person ("you"). Warm, steady, never cute.
- Banned words: *guaranteed returns, beat the market, get rich, hack, crush, behind, too late, failed, missed*.
- Numbers always with units and context ("$5 a week — about the cost of a coffee").
- Spanish is a real translation, not machine-literal (see §11 Q5). Use "tú" form.
- All copy lives in `src/i18n/*.json` or `src/content/*.json` — **no hard-coded strings in components** (so translation is one-file work).

---

## 9. THE SPLIT — contract between Part 1 and Part 2

### 9.1 Ownership

| Area | Part 1 (us) | Part 2 (other AI) |
|---|---|---|
| Repo scaffold, Astro config, i18n routing, CSP, SW, deploy config | ✅ | ❌ read-only |
| `src/styles/tokens.css`, `global.css` | ✅ | ❌ read-only |
| `src/components/*` (shared, §6) | ✅ | ❌ import only; request props via HANDOFF.md |
| `src/pages/index.astro`, `grow.astro`, `glossary.astro`, `about.astro`, `404.astro` (+ `/es/` twins) | ✅ | ❌ |
| `src/features/roadmap/*`, `readiness/*`, `kaizen/*` | ✅ | ❌ |
| `src/pages/learn.astro`, `practice.astro`, `your-path.astro`, `help.astro` (+ `/es/` twins) | stub only | ✅ |
| `src/features/explorer/*`, `crash-sim/*`, `life-stages/*`, `resources/*` | ❌ | ✅ |
| `src/content/resources.json`, `faq.{en,es}.json` | ❌ | ✅ |
| `src/content/glossary.{en,es}.json` | ✅ seeds | ✅ **append-only** new keys |
| `src/i18n/{en,es}.json` | ✅ `common.*`, `home.*`, `grow.*` | ✅ `learn.*`, `practice.*`, `path.*`, `help.*` namespaces only |

### 9.2 Order of work
1. **Part 1 ships first** the foundation (scaffold + tokens + shared components + layout + stub pages for Part 2 routes with `TODO: Part 2` placeholders) and tags the commit `part1-foundation`.
2. Part 2 starts from `part1-foundation` on its own branch. Part 1 continues on F1–F4 in parallel — no file overlap per §9.1.
3. Merge: Part 2 PR touches only its owned files. Conflicts only possible in `glossary` and `i18n` JSON (append-only, separate namespaces).

### 9.3 Definition of done (both parts)
- [ ] `npm run build` passes, `npm run check` (astro check / tsc) clean.
- [ ] Lighthouse mobile: Performance ≥ 95, Accessibility ≥ 95 (run `npx lighthouse` or `unlighthouse`).
- [ ] axe-core: 0 violations on every page you own (Playwright + `@axe-core/playwright` script in `tests/a11y.spec.ts`, Part 1 provides the harness).
- [ ] Keyboard-only walkthrough works; visible focus everywhere.
- [ ] 320px wide: no horizontal page scroll.
- [ ] `prefers-reduced-motion` respected.
- [ ] Every section has a SafetyBadge; every projection has "Example, not a promise."
- [ ] EN and ES pages both render; no hard-coded strings.
- [ ] No network requests at runtime other than same-origin (check DevTools / Playwright `page.on('request')`).
- [ ] Click-budget table (§2) updated; nothing deeper than 3 clicks.

### 9.4 Handoff file
Part 1 writes `HANDOFF.md` with: how to run, component usage examples, glossary keys available, known gaps. Part 2 appends a "Part 2 notes" section with what it shipped and any prop requests.

---

## 10. Out of scope (do not build)
Live broker integration or real trades · user accounts / login · storing any personal data · bank credential aggregation (Plaid etc.) · paid advice · affiliate links · analytics/trackers (unless §11 Q4 changes this) · newsletter signup · chatbots.

---

## 11. Open questions (with defaults — builders use the default until answered)

**✅ Decided by product owner (Nov 20 2026):** Q1 Astro · Q2 milestone order as in §7 F1 · Q4 no analytics at all · Q7 "Where You Want to Be" · Split as in §9.1.

| # | Question | Default used until answered |
|---|---|---|
| Q1 | Tech stack: Astro static + vanilla TS islands OK? | ✅ **Decided: Astro** |
| Q2 | The PRD never lists the 8 milestones or the 3rd readiness question. | ✅ Milestones **decided** as in §7 F1. 3rd readiness question still default (§7 F2) |
| Q3 | "You / Kids / Grandkids" tiers aren't defined in the PRD. | +25 yrs growth per generation, no new contributions |
| Q4 | Success metrics (engagement %, click-through, micro-survey) need measurement, but the PRD also says zero tracking. | ✅ **Decided: no analytics at all.** Metrics only from hosting-level aggregate logs |
| Q5 | Who writes/approves the Spanish copy? | AI drafts; marked `"reviewed": false` in JSON until a native speaker signs off |
| Q6 | PRD mentions the Alpaca paper-trading sandbox. Name it on the site? | **Don't name it** (non-commercial rule) — say "a practice account" |
| Q7 | Site/brand name in header: "Where You Want to Be", "Catch Up Sprint", or "One of Wun"? | ✅ **Decided: "Where You Want to Be"** |
| Q8 | Hosting target: Vercel or Netlify? | Netlify (`netlify.toml`), Vercel config also included |
| Q9 | PRD user flow says slider $5–50 & 20–40 yrs; feature spec says $5–100 & 10–60 yrs. | **$5–100, 10–60** (feature spec wins) |
| Q10 | SECURE 2.0 "super catch-up" for ages 60–63 (higher 401(k) limit) — include? | Mention in one line with a "Talk to a licensed pro" badge; no number shown |
| Q11 | Logo / imagery? | Text wordmark + simple inline SVG path illustration; no photos |

---

## 12. Repo layout (target)

```
/
├─ context/             ← this folder (README, SHARED, PART-1, PART-2, SKILLS)
├─ HANDOFF.md            ← Part 1 → Part 2 notes
├─ astro.config.mjs
├─ netlify.toml / vercel.json
├─ public/fonts/ , public/sw.js , public/favicon.svg
├─ src/
│  ├─ styles/tokens.css, global.css
│  ├─ components/        (shared — Part 1)
│  ├─ features/
│  │  ├─ roadmap/ readiness/ kaizen/          (Part 1)
│  │  └─ explorer/ crash-sim/ life-stages/ resources/   (Part 2)
│  ├─ content/ glossary.en.json glossary.es.json resources.json faq.*.json
│  ├─ i18n/ en.json es.json  + utils.ts (t(), getLang())
│  └─ pages/ index grow learn practice your-path help glossary about 404  + es/…
└─ tests/ a11y.spec.ts, no-network.spec.ts, calc.spec.ts
```
