# Flag game ("Вгадай країну за прапором")

Autonomous session started 2026-10-22. Oleh said "працюй автономно ... коміть і працюй сам", so no
questions before the start; every open point is a decision in `decisions.md`.

Repo: `/Users/olehrak/repos/personal/kids-portal` (new). Work happens in the worktree
`worktrees/flag-game` on branch `flag-game`. Never push, open a PR or merge. The task notes live in
this repo under `docs/flag-game/`; the Payslick backlog is not used.

## Scope (from Oleh)

- A random flag is shown; the kid types the country name with the physical keyboard or an on-screen
  keyboard the app provides.
- Flags already shown are not repeated until a page reload or a new game.
- Almost all countries, but not tiny island states or very obscure ones (Marshall Islands, Saint Kitts
  and Nevis and the like).
- Hints, each one easier: first the part of the world and a map with the country (no labels, not
  Google Maps), then the letter count (empty slots), then the first letter, and so on.
- On a correct answer: a sound and confetti, then an automatic move to the next flag after a delay.
- Harder levels: one also asks for the capital, another asks for the English name.
- Other useful features at my discretion.
- Everything (data, settings) lives in the frontend: a static site deployable to Cloudflare, no server.
- React and Tailwind.
- Scripts to run, build and deploy (deploy prepared, can't be verified without keys), and GitHub
  Actions for auto-deploy.
- Commit by commit, each commit reviewed by one agent (no multi-lens review: low-priority project).
- At the end, check the result with Playwright.

## Phases

1. Scaffold: Vite + React + TypeScript + Tailwind, Bun scripts, Biome, unit tests.
2. Country data (names, aliases, capitals in Ukrainian and English, regions, tiers) with integrity tests.
3. Game logic: answer matching, the deck without repeats, hints and letter slots, with unit tests.
4. UI: flag, answer field, on-screen and physical keyboard, hints with a world map, feedback, sound,
   confetti, auto-advance.
5. Levels: country, country + capital, English name; start screen with settings; round summary.
6. Deploy: Cloudflare config, deploy script, GitHub Actions for CI and deploy.
7. E2E with Playwright, final whole-branch review, screenshots, PR body draft.

## Done when

- All phases committed on `flag-game`, each commit reviewed.
- `bun run check` (typecheck, lint, unit tests, build) and the Playwright e2e pass.
- Screenshots of the main screens are in the scratchpad for Oleh.
- `decisions.md` lists the decisions and the open questions.
