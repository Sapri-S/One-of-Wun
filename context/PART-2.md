> **Status: ✅ shipped.** All four pages are built; see "Part 2 notes" in `/HANDOFF.md`. The brief below is kept for reference and for future edits.
> **Update Nov 20 2026:** `/practice` is replaced by `/invest` (mock market, real prices, play money) and `/grow` is merged into `/save` (demo bank + high-yield savings + Kaizen calculator). See SHARED.md §7 F7/F10 and HANDOFF.md "Part 2 notes". The crash-simulator brief below is historical.

# PART 2 brief: Learn, Practice, Your Path, Help

> Read `SHARED.md` in full first, then `/HANDOFF.md` (written by Part 1). This brief only says what is **yours**.

## Before you start
- **Start from branch `claude/pensive-newton-q7dfkn` at its latest commit** (Part 1 foundation + first-visit UX rework). Create your own branch from it. Do not start from an earlier commit.
- Run `npm ci && npm run dev` and open the stub pages (`/learn`, `/practice`, `/your-path`, `/help`); you will replace them.
- Read `HANDOFF.md` for the component API. **Import the shared components; never copy, fork or restyle them.** If you need a change, add a "Prop request" note to `HANDOFF.md` under "Part 2 notes" and work around it in the meantime.

## You own (SHARED §9.1)
- Pages: `src/pages/learn.astro`, `practice.astro`, `your-path.astro`, `help.astro`, and their `/es/` twins
- Features: `src/features/explorer/`, `crash-sim/`, `life-stages/`, `resources/`. Each already has a stub view (`LearnView.astro`, `PracticeView.astro`, `PathView.astro`, `HelpView.astro`) that the route files render. **Replace the stub's body; keep the file name and its `lang` prop.**
- Content: `src/content/resources.json`, `src/content/faq.{en,es}.json`
- i18n: only the `learn.*`, `practice.*`, `path.*` and `help.*` keys in `src/i18n/{en,es}.json`
- Glossary: you may **add** new keys to `glossary.{en,es}.json`; never edit or remove existing ones

**Read-only for you:** tokens, global CSS, components, layout, config, the service worker, and Part 1 pages.

---

## Build order
### 1. `/learn`: Investment Explorer (F6, P0)
3 cards (Index funds, Single stocks, Bond funds) with a 1–5 risk bar (also given as text), a yearly cost in dollars per $1,000, and preset chips for $100 / $1,000 / $10,000. Wrap jargon in `<Term>`. **No tickers, fund names or brokers.** Badge: `education`.

### 2. `/practice`: Crash Simulator (F7, P1)
$1,000 practice portfolio → "Simulate a 30% market drop" → scripted count-down to $700 with an SVG dip (instant if reduced motion is on) → a 4-step calm coaching stepper → optional "Show a recovery" marked "Example, not a promise" → an always-visible "Reset practice portfolio". **Don't name Alpaca or any provider**; say "a practice account".

### 3. `/your-path`: Life Stages (F8, P1)
`Tabs` with hash deep links: `#catch-up` (Sunita, 50+; $8,000 401(k) / $1,100 IRA extra; forward from "Day 1"; never show "missed years"; Social Security timing and debt levers; one line on the 60–63 super catch-up with no number; badge `talk-to-pro`), `#gig` (Tariq), `#first-gen` (Ayanna), `#banked` (Guadalupe). Each tab: a short story, a 3–5 step visual checklist (not saved), and a "Try this tool" link.

### 4. `/help`: Resources & FAQ (F9, P1)
Category chips plus a client-side search filter (show a friendly "no matches" state with a "Clear search" button). Resource cards use `ExternalLink`. Use the minimum list in SHARED §7 F9 and **check every URL resolves** before shipping. FAQ with `<details>`, 8–12 questions, and "Is this financial advice?" and "Do you save my numbers?" among them.

## Make it obvious for a first-time visitor (product owner's top priority)
- **Start every tool with `<HowItWorks steps={[…3 verb-first steps…]} />`**, right under the page intro (see `/grow` and `/next-step`).
- The page `<h1>` matches its menu name: **Investing basics, Practice a drop, My situation, Free help** (`common.nav.*`).
- **One primary (filled) button per screen.** Everything else is `variant="quiet"` or a text link.
- Steppers and coaching flows: **one step at a time**, "Step n of N", plus Back and Reset buttons (copy the pattern in `src/features/readiness/ReadinessCheck.astro`).
- Buttons say exactly what happens ("Simulate a 30% market drop", not "Go").
- If a visitor could wonder "what now?" at the end of a tool, end with a next-step link to another page.

## Rules that are easy to miss
- Every `Section` needs a `badge`. Every projection needs `<Disclaimer variant="projection" />`.
- No `localStorage`/`sessionStorage`, no fetches to other sites, no new npm runtime dependencies without a note in `HANDOFF.md`.
- Tabs and the coaching stepper must work with the keyboard alone (arrow keys for tabs, visible focus).
- Spanish copy: draft it and set `"reviewed": false` in the JSON (SHARED §11 Q5).
- Add any new destination to the click-budget table in SHARED §2. Nothing may take more than 3 clicks.

## Done when
Every box in SHARED §9.3 is checked for your pages, the a11y and no-network tests pass on your routes, and "Part 2 notes" in `HANDOFF.md` lists what you shipped, the defaults you used and any prop requests. Open a PR that touches only Part 2 files.

---

## Kickoff prompt (paste into the Part 2 agent)
```
You are the Part 2 builder for the "Where You Want to Be" website.
Check out branch claude/pensive-newton-q7dfkn (latest commit) and create your own branch from it.
Read context/README.md, then context/SHARED.md in full, then context/PART-2.md, then /HANDOFF.md, then context/SKILLS.md.
Install or enable the skills listed for Part 2 in SKILLS.md.
Build /learn, /practice, /your-path and /help (+ /es/ twins) using ONLY the shared components from Part 1.
Touch only the files Part 2 owns (SHARED.md §9.1). Follow the 3-click rule and the hard rules in SHARED.md §1.
When a decision isn't covered, use the default in SHARED.md §11 and record it in HANDOFF.md under "Part 2 notes".
```
