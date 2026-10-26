# The odd-one-out game

Started on 2026-10-26 as an autonomous session, after Oleh answered the questions below. The work
happens in the repo root on `main`, one general reviewer per commit.

## Agreed with Oleh

- Four pictures: three of one category, one of another; the kid taps the odd one. Many categories
  of things, animals and food.
- The pictures are Microsoft Fluent Emoji 3D (MIT), stored in the repo, not linked.
- Categories close to each other mix too (fruit and vegetables, forest and domestic animals,
  clothes and shoes), on one level.
- The game asks aloud, "Що тут зайве?", and after the right tap says why: "Так! Це фрукти, а
  машина — це транспорт." After a wrong tap it names the picture: "Яблуко — це фрукт. Що тут
  зайве?" The language switch of the other games picks UA, ENG or UA+ENG.

## Decisions

### Pictures

- **Fluent Emoji 3D** (Microsoft, MIT): one bright object on a clear background, all in one style,
  hundreds of things. The 256 px PNGs were converted to WebP (quality 88) with `sharp`, outside
  the repo, so the project gains no dependency: about 7 KB a picture, 1.2 MB for all 158. They
  live in `public/fluent-emoji/<thing id>.webp`, served as plain files, with the MIT licence next
  to them; the start screen credits them. Adding a thing means converting its Fluent 3D PNG the
  same way.
- **Checking the pictures.** An agent looked at contact sheets of 200 candidates and flagged the
  ones a 4-year-old would misread. Left out: mango (reads as a lemon), donkey (a grey leaping
  horse), badger (reads as a raccoon), the hen (a head with a big comb, taken for a rooster),
  squid (taken for an octopus), the exercise book (looks like a book), the sandal (an abstract
  strap), the glass (a whisky glass with ice), the "train" (a metro front), banjo, djembe,
  hibiscus, lotus, cherry blossom and the white flower (Japanese text on it). Renamed to what the
  picture shows: the flute is a recorder (сопілка), the chipmunk with an acorn is a squirrel
  (білка), the "tennis" picture is a tennis racket, the musical keyboard is a piano.

### Categories

- **21 categories, 158 things**, in the categories of Ukrainian kindergartens: fruit, vegetables,
  berries, sweets, transport, domestic animals (with the cat and the dog), forest animals
  (лісові звірі), animals of hot countries, birds, insects, sea animals, clothes, shoes, kitchen
  things (посуд), tools, musical instruments, school things, toys, sport, flowers, devices
  (техніка). Each has 4 to 12 things.
- **A thing a kid could count in two categories** lists the second one (`alsoIn`). It is never
  the odd one next to the three of that category, nor one of the three next to an odd one of it,
  so every round has one answer. The cases: berries are fruit in English; the rooster, duck,
  goose and turkey are domestic; the owl and eagle live in the forest; the parrot, flamingo and
  peacock in hot countries; the penguin by the sea, and some crocodiles in it; the bicycle and
  trainers are for sport; skates and skis come with boots; balls are toys; little kids play with
  a drum and maracas; scissors and a ruler are tools; a boxing glove is a glove. So berries and
  fruit never meet; every other pair of categories does, through the things that fit only one.
- **No three but the three fit one category**: a guitar, a drum and maracas never come with a
  ball, as the drum, the maracas and the ball are all toys, and the guitar would be odd too.
- **Lookalikes never share a round:** the bear and the teddy bear, whose pictures are both a
  smiling brown bear head.
- **Rounds.** Every category is the three once before any is again, and never twice in a row.
  The odd one's category is picked at random among the others, then the odd thing in it.

### Speech and screen

- **The phrases.** "Що тут зайве?", "Which one doesn't belong?". After the right tap: "Так! Це
  фрукти, а машина — це транспорт.", "Yes! These are fruits, and the car is a vehicle." After a
  wrong one: "Яблуко — це фрукт. Що тут зайве?", "The apple is a fruit. Which one doesn't
  belong?". The categories without a handy noun say what the things are for: "Лижі — для
  спорту", "The skis are for sport", "for school", "for the kitchen". A plural English name gets
  the plural: "The grapes are berries".
- **British English**, as in the colour game: lorry, biscuit, sweet, aubergine, ladybird,
  spanner, trainers, motorbike, football.
- **The speech timeout grows with the phrase.** If a voice never says it has finished, a phrase
  counted as over after 3 s; the explanation takes up to 5–6 s, so the next question would have
  cut it off. Now a phrase gets 120 ms per character, 3 s at least, in every game; the short
  phrases of the other games keep their 3 s.
- **The next four** come once the explanation is said, 0.4 s after it, and at least 2.6 s after
  the tap; their pictures load meanwhile.
- **After the right tap** the odd card turns green, and the three turn violet and shrink a
  little, so "these are fruits" points at them. The odd card doesn't grow: next to the screen's
  edge it would touch it.
- **The cards don't move when the explanation comes.** The question and the explanation take the
  same place above the cards, the one not said invisible, so the header keeps the taller one's
  height through the round. The explanation's letters grow with the width: a phrase takes one
  line on a tablet or a computer, and up to five on a small phone in portrait, where the room
  above the cards is free anyway.
- **The cards** are squares as big as the room allows, together in the middle: two by two, or
  four in a row when the room is more than twice as wide as it is high (a phone in landscape).
- **The home card says 4+:** the categories are harder than finding a colour or an animal.

## Open questions for Oleh

1. **The age on the home card is 4+.** The categories are harder than a colour or an animal; the
   classic "find the odd one" task is for 4–5-year-olds.
2. **Berries and fruit never meet**, since berries are fruit in English. Every other pair of
   categories does, close ones included.
3. **English words are British** (lorry, biscuit, sweet, aubergine, ladybird, spanner,
   trainers), as in the colour game.
4. **"The cherry is a berry"** is wrong in English, where a cherry is a stone fruit, but вишня is
   a berry in a Ukrainian kindergarten, and the berries need a fourth thing. Berries and fruit
   never meet, so no round is wrong because of it; only the sentence is.
5. **Weak pictures**, worth a look: the fox, wolf, bear, boar, moose and lion are heads with
   cartoon faces, so next to whole animals the style alone can give the odd one away; the eagle,
   beaver and octopus are a little abstract; the phone looks like a tablet; the cup is full of
   coffee; the rose looks like a red tulip; few kids know a hyacinth or a yo-yo; the squirrel is
   a chipmunk with an acorn.
6. **No button to hear a card's name.** A wrong tap names the picture; a 🔊 on every card, as in
   the animal game, could name it without a guess.
7. **I never heard the speech**: the explanation is the longest phrase in the games so far,
   worth a listen in both languages.
