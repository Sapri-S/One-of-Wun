# /context — start here

This folder holds everything an AI builder needs for the **"Where You Want to Be"** website.
The work is split between two separate AI agents, and each one reads only its own files plus the shared ones.

| File | Who reads it | What it is |
|---|---|---|
| `README.md` | Both | This index |
| `SHARED.md` | **Both, in full, first** | Master spec: product, personas, hard rules, 3-click rule, design tokens, shared components, all feature specs, split contract, open questions |
| `PART-1.md` | Part 1 builder | Brief for Part 1: foundation, Home, calculator. Includes a ready-to-paste kickoff prompt |
| `PART-2.md` | Part 2 builder | Brief for Part 2: Learn, Practice, Your Path, Help. Includes a ready-to-paste kickoff prompt |
| `SKILLS.md` | Both | Which skills and plugins to install, and which one to use at each step |

## Reading order
1. `SHARED.md` (the whole file)
2. Your own `PART-x.md`
3. `SKILLS.md`, then install what it lists
4. After Part 1 ships: `/HANDOFF.md` in the repo root

## If two files disagree
`SHARED.md` wins over a `PART-x.md`, and a `PART-x.md` wins over `SKILLS.md`. Decisions marked ✅ in `SHARED.md` §11 are final.

## Source
*Catch Up Sprint Milestone Path PRD v1* (SymStudio, Nov 20 2026). The product owner's decisions are recorded in `SHARED.md` §11.
