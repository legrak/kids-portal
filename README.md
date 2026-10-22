# Kids Portal

Small educational games for kids, under the name **Граймося!** ("Let's play!"). The home page at
`/` lists the games; each game has its own path. The UI is in Ukrainian.
- **Вгадай країну** ("Guess the country", `/flags`): a flag is shown and the kid types the
  country's name.

It is a static site: all data and settings live in the browser (settings in `localStorage`), so it
deploys to Cloudflare as plain files, with no server.

## The flag game

- 139 countries; tiny island states and countries a kid in Ukraine hardly ever hears of are left
  out (see `src/games/flags/data/countries.ts`).
- Three levels: the country's name in Ukrainian, the name and the capital, or the name in English.
- A part of the world to play (all, Europe, Asia, Africa, the Americas) and an easier set of 45
  well-known countries.
- Rounds of 10 flags without repeats until a new game or a page reload, with a summary, stars and
  a replay of the hard flags.
- Hints that get easier: where the country is on a world map, the number of letters, then letters
  one by one.
- Forgiving answers: case, spaces, hyphens and apostrophes don't matter, small typos pass, and an
  answer naming another country says which one it is.
- Phones and tablets type with their own keyboard; computers also get an on-screen keyboard, and a
  kid on an English keyboard layout still types Ukrainian letters.

Design decisions and open questions are in [`docs/flag-game/decisions.md`](docs/flag-game/decisions.md).

## Development

Needs [Bun](https://bun.sh).

```sh
bun install
bun run dev         # dev server at http://localhost:5173
bun run check       # typecheck, lint, unit tests and build
bun run test:e2e    # Playwright tests against the built site (desktop, phone, tablet)
bun run format      # format and fix lint issues
```

Before the first e2e run, install the browser: `bunx playwright install chromium`.

## Deployment

The site runs on Cloudflare Workers as static assets (`wrangler.jsonc`; no Worker code).
- **Manually:** `bunx wrangler login` once, then `bun run deploy` (builds and uploads `dist/`).
- **Automatically:** the GitHub Actions workflow `.github/workflows/ci.yml` checks every push and
  pull request, and deploys every push to `main` once the checks pass. It needs two repository
  secrets:
  - `CLOUDFLARE_API_TOKEN`: an API token made from the "Edit Cloudflare Workers" template;
  - `CLOUDFLARE_ACCOUNT_ID`: the account ID from the Cloudflare dashboard.

  The deploy job runs in the `production` environment, so it can be given protection rules.

## Project layout

```
src/
  App.tsx                    picks the page by the path
  router.ts                  the current path and in-app links, with the History API
  home/                      the home page with the list of games
  components/                parts shared by the games
  games/flags/
    data/countries.ts        countries: names, capitals, regions, tiers
    logic/                   game rules, answer checking, hints, keyboards (unit-tested)
    components/              screens and widgets
e2e/                         Playwright tests
docs/flag-game/              task notes and the decision log
```

## Credits

- Flags: [flag-icons](https://github.com/lipis/flag-icons) (MIT).
- Map: [world-atlas](https://github.com/topojson/world-atlas) (ISC), from
  [Natural Earth](https://www.naturalearthdata.com/) (public domain), drawn with
  [d3-geo](https://github.com/d3/d3-geo) and [topojson-client](https://github.com/topojson/topojson-client) (ISC).
- Confetti: [canvas-confetti](https://github.com/catdad/canvas-confetti) (ISC).
- Font: [Nunito](https://fonts.google.com/specimen/Nunito) via Fontsource (OFL 1.1).
