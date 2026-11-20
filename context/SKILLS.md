# SKILLS.md: what to install and when to use it

These are Claude plugins from the **Anthropic Directory** (claude.ai → Customize → Plugins, or the plugin card in Claude Code). Install them **before** you start.

> **Not using Claude?** Skip installing. Every rule these skills enforce that matters here is already written into `SHARED.md` (tokens, motion, a11y, copy rules). Use the "Use it for" column as a review checklist instead.

## 1. Install list

| Plugin (Directory name) | Publisher | Part 1 | Part 2 | Why |
|---|---|:-:|:-:|---|
| **frontend-design** | Anthropic | ✅ | ✅ | Intentional visual design that doesn't look templated |
| **Design** | Anthropic | ✅ | ✅ | Accessibility audit, UX copy, design critique, dev handoff |
| **VectorLab UI/UX Skills** | VectorLab | ✅ | ✅ | Calm, low-friction UI rules: motion, reduced motion, keyboard, spacing, viewports, final UX audit |
| **Website Design** | UXKIN | ✅ | optional | Writes the design system down as DESIGN.md; reviews finished pages |

Optional for both: **UI/UX Behaves** (a rule set for screen states such as no results, invalid input and tabs). It's useful for the `/help` search and the `Tabs`.

**Already built into Claude Code (no install):** `run` (launch the site and take screenshots), `code-review`, `simplify`, `security-review` (for checking CSP and that nothing reaches other sites).

> Note: the Website Design plugin's **UXKIN connector** may fail to connect in locked-down cloud sessions. That's fine: its skills still work without it. **Do not** let it pick a new design direction; the direction is fixed in SHARED §5.

---

## 2. When to use each skill

### Part 1
| Step | Skill(s) | Use it for |
|---|---|---|
| Phase A start | `website-design:web-design-system` | Turn SHARED §5 into a `/DESIGN.md`. **Copy the existing tokens; don't invent new colours** |
| Tokens & base CSS | `vectorlab-ux-skills:colour-palette`, `typography`, `spacing` | Check the 60-30-10 colour split, type scale and 8pt rhythm |
| Shared components | `frontend-design:frontend-design`, `vectorlab-ux-skills:keyboard`, `icon-buttons` | Build `Term` popover, `Tabs`, `Button` with full keyboard support and visible focus |
| Nav / bottom tab bar | `vectorlab-ux-skills:viewports`, `page-patterns` | Layouts that work from 320px to 1280px, and the marketing page pattern |
| Roadmap & toggle animation | `vectorlab-ux-skills:motion`, `transitions`, `reduced-motion` | 240ms ease, nothing jumping, motion off when the visitor asks |
| Readiness check & calculator inputs | `vectorlab-ux-skills:forms`, `labels`, `defaults` | Visible labels, sensible defaults ($5, 30 years), no blank states |
| All copy | `design:ux-copy`, `vectorlab-ux-skills:verbs` | 6th–8th grade wording, verb-first buttons ("Show my result", not "Submit") |
| `HANDOFF.md` | `design:design-handoff` | Component specs, props, states and examples for Part 2 |
| Before tagging and before done | `design:accessibility-review`, `vectorlab-ux-skills:ux-audit`, `anti-slop`, `website-design:web-review`, `security-review` | Final checks against SHARED §9.3 |

### Part 2
| Step | Skill(s) | Use it for |
|---|---|---|
| Before each page | `vectorlab-ux-skills:page-patterns` | Pick one page pattern per page and stick to it |
| Explorer cards | `frontend-design:frontend-design`, `vectorlab-ux-skills:surfaces` | Calm cards, inline detail (no modals) |
| Crash simulator | `vectorlab-ux-skills:motion`, `reduced-motion`, `loaders` | Scripted count-down that is instant when motion is off; no spinners |
| Life Stages tabs | `vectorlab-ux-skills:keyboard` (+ UI/UX Behaves `ui-ux-tabs` if installed) | Arrow-key tabs and hash deep links |
| Help search and filters | `vectorlab-ux-skills:empty-states`, `forms`, `labels` | Friendly "no matches" state with a "Clear search" button |
| All copy (EN and ES drafts) | `design:ux-copy`, `vectorlab-ux-skills:verbs`, `errors` | Plain, shame-free, verb-first |
| Before done | `design:accessibility-review`, `vectorlab-ux-skills:ux-audit`, `anti-slop`, `code-review` | Final checks against SHARED §9.3 |

## 3. Things the skills must NOT override
- Colours, font and motion timings in SHARED §5 are fixed.
- No modals except the jargon popover (SHARED §2).
- No analytics, no storage, no outside requests (SHARED §1).
- No gamification, even if a skill suggests "delight" moments.
