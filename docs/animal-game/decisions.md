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

### Photos and sounds

- **Wikimedia Commons for both.** It allows linking its files from other sites (Commons warns that
  a linked file can be renamed or deleted), each file states its licence, and both hosts answer
  cross-origin requests. Pixabay forbids linking; Unsplash has no animal sounds. Only CC0, public
  domain, CC BY and CC BY-SA files are used; the start screen lists the author, licence and source
  of every file, as CC BY asks. `bun run check:media` checks that every link still answers.
- **Photos are 500 px Commons thumbnails.** Commons now serves thumbnails in standard widths only
  (250, 330, 500, 960...); 500 px is light to load and a little soft on a retina screen, where
  a card is 700–800 px wide. The card crops to 4:3; for some photos the
  data says which part to keep (CSS `object-position`), so a head is not cut off.
- **Choosing the photos.** For each animal a script took up to 8 candidates from Commons' quality
  images by the species name (a wider search where none was good), and agents looked at each one:
  the right animal as a kid knows it, one animal, big and whole, still framed after the 4:3 crop,
  nothing a parent would object to (blood, prey, dead animals, people, text), a calm background.
  Weak spots left: the pig is a wrinkled minipig (the classic pink pig photos had piglets around it
  or were tiny), the sheep's back is behind a rock (the one whole sheep had a red paint mark that
  reads like blood), the chimpanzee sits in a zoo enclosure.
- **Sounds are MP3s.** Commons makes an MP3 of every Ogg or WAV file; Ogg plays on iPhones only
  from iOS 18.4. A long recording plays a 4 s part, given as a media fragment (`#t=8,12`).
- **Checking the sounds.** I can't listen, so two classifiers did, locally (the tools stayed out
  of the repo): AST, trained on AudioSet, for the animals AudioSet has a class for, and CLAP,
  asked which of the 30 animals or of a few non-animal sounds (speech, music, wind, a car) each
  4 s part sounds like. A recording was picked when CLAP put the animal first or AST heard its
  class, the file's description agreed, and the part with the best score became the clip. Notes:
  - Goat: CLAP prefers "sheep" (a bleat is a bleat); AST hears a bleat; the file is a herd of
    goats. Sheep and goat never share a round.
  - Turkey: AST hears "Turkey" and "Gobble"; CLAP says goose.
  - Squirrel: CLAP ranks it second, after the monkey; it is a British Library recording of a grey
    squirrel's call. Commons has no recording of the red squirrel.
  - Bear: the only bear growl is from a Yellowstone recording of a grizzly at night, where CLAP
    hears a bear first and AST a roar.
  - Bee: CLAP is sure (0.99), AST hears an insect and a fly. A honey bee recording AST liked
    more lasted 15 minutes, a 26 MB MP3 for 4 s of buzzing, so the shorter one won.
- **The list changed.** Mouse, snake and seal had no recording a kid would know (lab ultrasound,
  a rattle, an elephant seal), and the only scarlet macaw recording was heard as a monkey, a crow
  and speech, so the parrot went too. Pigeon, woodpecker and gull came in; AST has no gull class,
  but CLAP is sure (0.96) and the recordings are of herring gulls. 30 animals.
- **Lookalike groups:** horse and donkey; hen, rooster and turkey; tiger and lion; dog and wolf;
  duck, goose and gull; sheep and goat; crow, pigeon and cuckoo.

### The game

- **A card's 🔊 plays that card's animal**, so a kid can listen to each and compare it with the
  sound asked for; the 🔊 by the question repeats the question and the sound. (Open question: the
  card's button could replay the asked sound instead.)
- **Voice.** `speechSynthesis` with a voice of each language asked in, when the browser has one
  (iOS and macOS have the Ukrainian "Lesya", which iOS may need downloaded; Windows Chrome likely
  has no Ukrainian voice). If the voice never says it finished, the sound starts after 3 s a
  phrase anyway. Without a voice: the text and the sound.
- **Languages** (added on 2026-10-26, Oleh's request). The start screen has the switch of the
  colour game: UA, ENG or UA+ENG (the default), remembered in the browser apart from the colour
  game's, with the same notice when the device lacks a voice. The question and the heading after
  a find follow it: "Де корова? Where is the cow?", "Це корова! It's a cow!". The animal's sound
  plays once the last phrase is said.
- **Sound on phones.** iOS plays sound from a timer only on a player that has already played inside
  a tap, so the Play tap starts one reused `<audio>` with a moment of silence, and every animal
  plays through it. The page also tells iOS it plays sound on purpose (`audioSession`), so the
  success melody plays with the ringer switch off.
- **The next round's photos load ahead**, while the kid plays. Its sounds don't: iOS ignores
  loading ahead, and elsewhere it would fetch whole recordings of which 4 s play.
- **Tests run offline:** the e2e tests answer the Commons requests themselves.

## Open questions for Oleh

1. **The card's 🔊 plays that card's animal**, so a kid can compare; it could replay the asked
   sound instead.
2. **The list changed:** mouse, snake, seal and parrot out (no recording a kid would know, or none
   the classifiers trusted), pigeon, woodpecker and gull in.
3. **Weakest picks**, worth a look or a swap later: the photos of the pig (a minipig), the sheep
   (behind a rock), the chimpanzee (in a zoo enclosure) and the dolphin (half under water); the
   squirrel's sound (the classifier ranks it second).
4. **The bear's sound** comes from a recording of a grizzly eating a carcass at night; in the 4 s
   played the classifiers hear a growl, but it may hold some crunching. Worth a listen.
5. **The spoken question** was never heard by me: worth a listen on an iPhone, an Android phone
   and a computer.
