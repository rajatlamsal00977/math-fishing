# Build Checklist

Working plan is [PLAN.md](./PLAN.md). This file breaks that plan's Week 1–3 build
order into commit-sized chunks. Each unchecked box is meant to be: implement →
run it (`npm run dev`, click around) → commit → move to the next box. Nothing
here should take more than ~30–60 min; if a box feels bigger than that, split it
further before starting.

Cut order if the schedule gets tight (from PLAN.md §Notes): legendary lore →
dock shop upgrades → Fish Guide detail view → adaptive spawning. Keep adaptive
*difficulty* (2.5) no matter what — it's the cheapest AI feature to demo.

---

## Phase 0 — Repo & scaffold

- [x] 0.1 `git init`, `.gitignore`, README, PLAN.md, this file
- [x] 0.2 Vite + TypeScript scaffold, strip boilerplate, confirm `npm run dev` serves
- [x] 0.3 Add Phaser, minimal `BootScene` rendering "Math Fishing Game" text, confirm build + dev server both work
- [x] 0.4 Push to a remote (GitHub or otherwise) once you're ready — currently local-only
- [ ] 0.5 Deploy the empty Hello scene to Vercel (`vercel` CLI or dashboard import), confirm the public URL loads

## Phase 1 — Feel the loop (placeholder art, hardcoded problems)

Goal: by the end of this phase, one full catch — sail, cast, solve, reel in,
fish removed — works end to end, even if everything looks like colored
rectangles.

- [x] 1.1 `PondScene`: bounded pond background (solid color/tile), boat placeholder rectangle, WASD/arrow movement, camera bounded to pond edges
- [x] 1.2 Underwater layer: 4–6 placeholder fish sprites (colored circles) swimming in a gentle patrol pattern below the water line
- [x] 1.3 Casting: press SPACE near a fish → line-drop visual → bite after 1–3s (or auto-retract after 5s if nothing nearby)
- [x] 1.4 `ReelingScene` overlay: wooden-panel-placeholder, one **hardcoded** math problem, on-screen number pad (0–9, backspace, submit)
- [ ] 1.5 Tension bar: rises over ~15s idle, drops on correct answer, spikes on wrong answer
- [ ] 1.6 Win/lose logic: 3 correct → caught, 3 wrong (or full tension) → escapes with "Nice try!" — return to `PondScene` either way
- [ ] 1.7 Catch animation (can be a simple tween/flash) → fish removed from pond → respawns nearby after a delay
- [ ] **Milestone 1**: play a full loop start to finish with placeholder art + one hardcoded problem. Commit + tag `milestone-1-loop`.

## Phase 2 — Make it real (content + AI)

- [ ] 2.1 Source real assets (Kenney fish/UI packs, water tileset) into `public/assets/`, swap placeholders in `PondScene`/`ReelingScene`
- [ ] 2.2 `data/species.ts`: all 5 species + Golden Marlin, with topic/difficulty/coins/rarity from PLAN.md §6
- [ ] 2.3 `data/fallbackProblems.ts`: ~20 hardcoded problems per species (this unblocks everything below even if the API isn't wired yet)
- [ ] 2.4 `api/generate-problem.ts` Vercel function + `systems/ClaudeClient.ts`; wire `.env.local` with `ANTHROPIC_API_KEY` (confirm `.env*` stays gitignored); fall back to 2.3's bank on timeout/parse failure
- [ ] 2.5 `systems/DifficultyEngine.ts`: per-skill mastery tracking (3 correct → band up, 2 wrong → band down, floor at easy)
- [ ] 2.6 `systems/FishSpawner.ts`: adaptive spawn weighting by practice-need score
- [ ] 2.7 Coin economy + `DockScene`: sell fish, buy Sturdy Rod (100 coins), rod gates which species can be caught
- [ ] 2.8 `systems/SaveManager.ts`: LocalStorage read/write, auto-save after every catch, confirm a refresh preserves coins/rod/caught fish
- [ ] 2.9 `GuideScene`: grid of species (silhouette vs. caught), detail view (topic, times caught, best time)
- [ ] **Milestone 2**: real art, live Claude-generated problems with fallback, adaptive difficulty, savable progress. Commit + tag `milestone-2-real`.

## Phase 3 — Polish + demo

- [ ] 3.1 Audio: ambient loop, catch jingle, soft "plunk" on wrong answer (no buzzers)
- [ ] 3.2 Golden Marlin: legendary spawn logic (1%, once/session) + `api/generate-lore.ts` + LocalStorage cache keyed by species
- [ ] 3.3 Visual polish pass: catch particle effects, scene transitions, tension-bar juice
- [ ] 3.4 Tuning pass: difficulty curve, coin values, spawn rates — playtest and adjust
- [ ] 3.5 Record demo video per PLAN.md §13 script (target 2:30)
- [ ] 3.6 Write submission blurb
- [ ] Buffer: reserve ~2 full days before Sep 18 for bugs found during 3.5/3.6

---

### Conventions while working through this

- One box = one commit. Commit message: what the box says, past tense (e.g. "Add casting mechanic with bite delay").
- If a box breaks something that used to work, fix it before starting the next box — don't stack unverified changes.
- Placeholder art (rectangles/circles with `fillStyle`) is fine through all of Phase 1. Don't reach for real sprites early — it slows down loop iteration.
