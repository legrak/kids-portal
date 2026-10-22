# Decisions

Open questions for Oleh are marked **[open]**.

## Setup

- **No pre-start questions.** He said "працюй автономно ... працюй сам", so I took the "can't answer
  now" branch of the autonomous-session flow.
- **Repo layout.** `main` has one initial commit (README, .gitignore); the work is in the worktree
  `worktrees/flag-game` on the branch `flag-game`. `worktrees/` is excluded through
  `.git/info/exclude`, not `.gitignore`. The task notes are committed under `docs/flag-game/`, as
  Oleh asked mid-session.
- **Review.** Each commit gets one general reviewer agent (correctness, naming, readability, plus
  tests or architecture when the diff calls for it), as he asked for no multi-lens review.
- **Instructions added mid-session.** Everything lives in the frontend (static site on Cloudflare,
  no server); React and Tailwind; scripts to run, build and deploy plus GitHub Actions for
  auto-deploy; the task docs live in this repo; flags and maps come from libraries, never drawn by
  hand.

## Stack

- **Tooling.** Bun (package manager, unit tests), Vite 8, React 19, TypeScript 7, Tailwind 4 through
  `@tailwindcss/vite`, Biome 2 for lint and format, the Nunito variable font from Fontsource (has
  Cyrillic, bundled, no Google Fonts request).
- **Flags** come from the `flag-icons` package (SVG per ISO code), **the map** from `world-atlas`
  (Natural Earth country shapes) rendered with `d3-geo`. Nothing is drawn by hand; the favicon is
  the 🌍 emoji.
- **The game is the site root.** The repo is called kids-portal, but there is one game so far, so
  there is no portal home page yet; the game code sits in `src/games/flags/` so a home page with
  several games can be added later. **[open]** Do you want a portal home page now?
