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

## Country data

- **Which countries.** The 193 UN member states plus the Vatican. Kosovo, Taiwan and Palestine are
  not UN members and are left out. Israel's capital is given as Jerusalem. **[open]** Keep this set?
- **Russia and Belarus are in the game** as ordinary countries: it is a geography game. **[open]**
  Leave them out?
- **Left out (67), so 127 countries are in the game.** They stay in the data with
  `tier: "excluded"`, so bringing one back is a one-word change. **[open]** Is the cut right?
  - Tiny island states outside Europe (28): Maldives, Mauritius, Seychelles, Comoros, Cabo Verde,
    São Tomé and Príncipe, Bahamas, Trinidad and Tobago, Barbados, Fiji, Timor-Leste, the small
    Caribbean and Pacific states, plus Brunei.
  - Countries a kid in Ukraine hardly ever hears of (39), added after Oleh named Equatorial Guinea
    and Papua New Guinea mid-session. Africa: Equatorial Guinea, Guinea, Guinea-Bissau, Gambia,
    Burkina Faso, Djibouti, Eritrea, Lesotho, Eswatini, Burundi, Togo, Benin, Mauritania, Sierra
    Leone, Liberia, the Central African Republic, Gabon, the Republic of the Congo, Malawi, South
    Sudan, Chad, Botswana, Rwanda. Asia: Bhutan, Laos, Cambodia, Myanmar, Yemen, Oman, Bahrain.
    The Americas: Belize, Guyana, Suriname, El Salvador, Honduras, Nicaragua, Guatemala, Haiti.
    Oceania: Papua New Guinea.
  - All of Europe stays, microstates included: it is the part of the world a kid in Ukraine knows
    best.
- **A "well-known" set of 45 countries** (`tier: "famous"`): Ukraine's neighbours in the EU, most
  of Europe and the big famous countries elsewhere. It's for younger kids (see the settings).
- **Names.** Ukrainian names follow Ukrainian Wikipedia and use the apostrophe ’; common
  alternatives are accepted as aliases (Голландія, Молдавія, ОАЕ, США, Америка...). English names
  are the short common ones, typable on a plain keyboard: Turkey (Türkiye accepted), Ivory Coast,
  Czechia, DR Congo, Bogota without the accent. Where a country has several capitals, all are
  accepted (South Africa, Bolivia, Sri Lanka, Eswatini). "Kiev" is not accepted, only "Kyiv".
  "Англія" / "England" is not accepted for the United Kingdom: England is a part of it with a flag
  of its own.
- **Equatorial Guinea's capital** is Ciudad de la Paz (Сьюдад-де-ла-Пас) since the decree of
  2 January 2026; Malabo is still accepted while the move goes on.
- **Regions.** Russia and Cyprus are in Europe; Turkey, Georgia, Armenia and Azerbaijan in Asia;
  Central America and the Caribbean in North America. The hint names the region, so a kid sees
  "Європа" for Cyprus, as Ukrainian schoolbooks do.
- **Checked against references.** The ISO numeric codes match `i18n-iso-countries` for all 194, every
  code has a flag in `flag-icons`, and every country in the game has a shape in world-atlas 1:50m
  (1:110m misses eight microstates, so the map uses 1:50m).

## Checking answers

- **What does not count.** Case, spaces, hyphens, apostrophes, dots, accents on Latin letters, and ґ
  versus г. "гвінея бісау" is right for Гвінея-Бісау.
- **Typos.** Names up to 4 letters must be exact, up to 8 letters may have one typo, longer ones
  two. Two swapped neighbouring letters count as one typo. A misspelt answer passes only when it is
  closer to the right name than to any other country's, so "Ірак" never passes for "Іран". After a
  misspelt answer the game shows the right spelling.
- **Another country's name** is not just "wrong": the kid sees "Ні, це не Ірак", and in the capital
  level "Варшава — столиця країни Польща".

## Game rules

- **Rounds of 10 flags.** After each round comes a summary with the stars and three choices: the
  next 10 flags of the same game, a replay of the hard ones (at most one star), or the menu.
  Flags already shown are not repeated within a game; a new game from the menu or a page reload
  starts over, as Oleh asked.
- **Stars per flag.** 3 without hints, 2 with one or two hints, 1 with more. Giving up gives 0, or 1
  if the country was found and only the capital was not. Wrong attempts cost nothing.
- **Hints, each easier.** Country: where it is (region and map), then the letter slots, then one
  letter at a time from the left. The English level adds the Ukrainian name after the map. The
  capital starts with the letter slots. The last letter is always left to type.
- **Filling every slot checks the answer at once**, so with the slots on there is nothing to press.
- **"Не знаю" ends the turn** and shows the answer (with the capital, in the capital level).

## Interface

- **Typing.** The answer is a real text field, so phones and tablets open their own keyboard (Oleh's
  request); the on-screen keyboard shows only on computers (a fine pointer). On a computer, keys
  type Ukrainian letters by position even when the layout is English or Russian, and a warning
  shows when letters of the wrong alphabet get in. The field keeps the focus between flags, so a
  phone keyboard stays open.
- **Layout.** One column on phones and tablets in portrait, two (flag and map left, answer right)
  from 1024 px. The Play button in the menu stays at the bottom of the screen.
- **After an answer.** A right answer: a melody, confetti, stars, and the next flag after 2.6 s. Giving
  up: the answer, the map, and the next flag after 5 s. "Далі →" or Enter go on at once.
- **Extras I added:** the "well-known countries" set and the part-of-the-world choice; stars and
  coloured progress dots; the replay of hard flags; the English level shows the Ukrainian name as a
  hint; another country's name in a wrong answer is named; the map zooms in on a tap; a mute button.

## Deploy

- **Cloudflare Workers with static assets** (`wrangler.jsonc`, no Worker code), which Cloudflare now
  recommends over Pages for new sites. `bun run deploy` deploys by hand; the GitHub Actions workflow
  deploys `main` after the checks and e2e tests pass. It needs the `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID` secrets. Checked with `wrangler deploy --dry-run` only: there are no keys.

## Not verified

- A real deploy (no Cloudflare keys) and a real GitHub Actions run (no remote).
- Real phones and tablets: the e2e tests run in Chromium with phone and tablet emulation. Worth a
  check on an iPhone and an Android phone: the keyboard staying open between flags, sounds.
