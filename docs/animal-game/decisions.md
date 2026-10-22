# Home page and the animal game

Autonomous session started 2026-10-23, after Oleh answered the questions below. The work happens in
the repo root on `main`, one general reviewer per commit; at the end I push `main` myself (Oleh's
OK), which deploys the site.

## Agreed with Oleh

### Step 1: a home page with the list of games

- The home page is at `/`, the flag game moves to `/flags`, the animal game is at `/animals`. The
  flag game keeps its saved settings.
- The site is called "Граймося!".
- Big, bright cards, easy to tap: a picture from the game, the title, one line about it and the
  age ("3+", "6+").
- Both games get a 🏠 button back to the home page in their menu.

### Step 2: the animal game ("find the animal", for 3-year-olds)

- Three animal photos. Above them the game asks in text which one to find; it also asks aloud
  ("Де корова?") when the browser has a Ukrainian voice, then plays the animal's sound. Without a
  usable voice: the text and the animal's sound only.
- Each card has a button that plays a sound.
- Real photos, not drawings, and real recordings of the animals. Both found on the internet and
  used as plain links; each photo is checked to show the right animal and each sound to be the
  right animal.
- About 30 animals that can be recognised by their sound: cat, dog, cow, pig, horse, donkey, sheep,
  goat, hen, rooster, duck, goose, turkey, tiger, lion, bear, wolf, elephant, monkey, deer,
  squirrel, mouse, frog, owl, crow, cuckoo, parrot, bee, snake, dolphin, seal. I may swap one when
  no good photo or recording turns up. Quiet animals (giraffe, rabbit, hedgehog) are left out.
- Similar animals are never shown together (horse and donkey, hen and rooster, tiger and lion,
  wolf and dog), or a 3-year-old can't tell them apart.
- No score, no rounds, no losing: the game goes on until the kid goes home. A wrong tap: the card
  shakes gently and the sound plays again. A right tap: a happy sound, confetti, the card grows,
  and the next three animals come after 2–3 s. An animal is not asked again until all have been
  asked.

## Decisions

### Home page

- **No router library.** Three paths need only the History API: `src/router.ts` gives the current
  path and in-app links that don't reload the page. Cloudflare's single-page fallback serves the
  page for `/flags` and `/animals` on a direct link or a reload. Any other path shows the home page.
- **The browser's Back leaves a game in progress**, as the round lives in memory. A game's saved
  settings stay.
- **Cards** sit two in a row from tablets up, an odd last one in the middle.
