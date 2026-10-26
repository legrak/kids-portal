# Kids Portal

Small educational games for kids, under the name **Граймося!** ("Let's play!"). The home page at
`/` lists the games; each game has its own path. The UI is in Ukrainian.
- **Знайди тварину** ("Find the animal", `/animals`), for 3-year-olds: three animal photos, the
  game asks for one and plays its sound, and the kid taps it.
- **Знайди колір** ("Find the colour", `/colors`), for 3-year-olds: four balloons, the game asks
  aloud for one in Ukrainian and English ("Де синій? Where is blue?"), and the kid taps it.
- **Вгадай країну** ("Guess the country", `/flags`): a flag is shown and the kid types the
  country's name, or picks it from four names on the easy level.

It is a static site: all data and settings live in the browser (settings in `localStorage`), so it
deploys to Cloudflare as plain files, with no server.

## The animal game

- 30 animals with a sound a kid can know, from the farm, the forest and the zoo; lookalikes (a
  horse and a donkey, a hen and a rooster) never share a round.
- The game asks "Де корова?", "Where is the cow?" or both (the default), as picked on the start
  screen, in text and aloud with the browser's voices, then plays the animal's sound; every card
  can play its own animal too.
- No score and no losing: a wrong tap shakes the card and plays the sound again, a right one gets
  confetti, and the next three animals come by themselves. An animal isn't asked again until all
  were.
- Real photos and recordings, linked from Wikimedia Commons; the start screen credits each one.
  `bun run check:media` checks that the links still answer.

Design decisions, the way the photos and sounds were chosen and checked, and open questions are in
[`docs/animal-game/decisions.md`](docs/animal-game/decisions.md).

## The colour game

- 12 everyday colours: red, orange, yellow, green, light blue, blue, purple, pink, brown, black,
  grey and white. Blue and light blue, both "blue" in English, never share a round.
- The question is said with the browser's voices and shown as text, in Ukrainian, English or
  both (the default), as picked on the start screen. Without a voice for a language, the start
  screen says what happens instead.
- No score and no losing: a wrong balloon shakes, and the game names its colour and asks again;
  the right one flies away with confetti, and the game says "Так, це синій!". A colour isn't
  asked again until all were.

Design decisions and open questions are in
[`docs/color-game/decisions.md`](docs/color-game/decisions.md).

## The flag game

- 139 countries; tiny island states and countries a kid in Ukraine hardly ever hears of are left
  out (see `src/games/flags/data/countries.ts`).
- Four levels: picking the country from four names, or typing the country's name in Ukrainian,
  the name and the capital, or the name in English.
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
bun run check:media # check that the animal game's photo and sound links still answer
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
  shared/                    confetti, synthesized sounds, voices and languages, and the rounds
                             of the games for little kids (unit-tested)
  games/animals/
    data/animals.ts          animals: names, photo and sound links with their credits
    audio.ts                 the animal sounds and the spoken question
    components/              screens and cards
  games/colors/
    data/colors.ts           colours: Ukrainian and English names, shades
    speech.ts                what the game says, in the language picked
    components/              the balloon and the start screen
  games/flags/
    data/countries.ts        countries: names, capitals, regions, tiers
    logic/                   game rules, answer checking, hints, keyboards (unit-tested)
    components/              screens and widgets
e2e/                         Playwright tests
scripts/                     maintenance scripts
docs/                        decision logs per game
```

## Credits

- Flags: [flag-icons](https://github.com/lipis/flag-icons) (MIT).
- Map: [world-atlas](https://github.com/topojson/world-atlas) (ISC), from
  [Natural Earth](https://www.naturalearthdata.com/) (public domain), drawn with
  [d3-geo](https://github.com/d3/d3-geo) and [topojson-client](https://github.com/topojson/topojson-client) (ISC).
- Animal photos and sounds: [Wikimedia Commons](https://commons.wikimedia.org/), each under its
  own licence (CC0, public domain, CC BY or CC BY-SA); the authors are listed in the game and in
  `src/games/animals/data/animals.ts`.
- Confetti: [canvas-confetti](https://github.com/catdad/canvas-confetti) (ISC).
- Font: [Nunito](https://fonts.google.com/specimen/Nunito) via Fontsource (OFL 1.1).
