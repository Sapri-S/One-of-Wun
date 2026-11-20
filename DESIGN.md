# DESIGN.md: Where You Want to Be

Calm, smooth, obvious. A quiet, sunlit room for money decisions. **Values live in `src/styles/tokens.css`. This file explains how to use them.**

## Personality
- **Steady, not cheerful.** No confetti, no streaks, no urgency.
- **Obvious, not clever.** Verb-first buttons that say exactly what happens. Icons always come with text.
- **Forward, never behind.** Progress flows left to right toward "Where you want to be".

## First visit
A new visitor should know what to do without help:
- Ask first ("What would you like to do today?"), then explain.
- Use task names, not labels ("Savings calculator").
- Every tool starts with a "How this works" strip.
- Ask one question at a time.
- Show one primary button per screen.

## The one memorable element
The **money path** on Home: 8 round stops joined by a trail line (dashed ahead, solid where you've walked), ending in a flag. Everything else stays quiet so the path can lead. Don't add other decorative illustrations that compete with it.

## Colour roles (60-30-10)
| Role | Token | Use |
|---|---|---|
| 60%: ground | `--bg` sage-tinted paper, `--surface` white | Page and cards |
| 30%: rhythm | `--surface-sage`, `--surface-mist` | Alternating section bands, soft panels |
| 10%: action | `--primary` sage-teal | One filled button per section, current state, selected controls |
| Links / info | `--accent` mist blue | Links, jargon underline, Education badge |
| Status | `--stop-*` clay, `--wait-*` honey, `--go-*` sage | Readiness only. Always with an icon and words |

Elevation: border first (`--border`), then a soft `--shadow` only on the main interactive surface of a section.

## Type
Atkinson Hyperlegible (400/700), self-hosted, one family. Body 18px / 1.6, never under 16px for reading text. Headings are 700 with slight negative tracking. No all-caps labels and no eyebrow text above headings (badges do that job). Numbers in tools use `.num` (tabular).

## Shape and space
Radius: 10 for small chips, 16 for cards, 24 for the main tool surface, pill for buttons and toggles. Spacing follows the 8pt scale (`--space-*`). Sections get 48px padding on mobile and 64px on desktop. Text measure is 65ch.

## Motion
240ms `--ease` for state changes only: toggles, popovers, the path marker, bars. No scroll-triggered entrances and no parallax. Under reduced motion everything is instant.

## Components
See `HANDOFF.md` §3. Pattern summary:
- **Section** = badge + heading + optional intro + content
- **Segmented toggle** (pill track, white raised thumb) for 2–3 options
- **Big yes/no tiles** for questions (real radio inputs)
- **Slider + ± buttons** for numbers (28px thumb)
- **Popover** only for jargon. No modals.
