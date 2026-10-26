# The colour game

Started on 2026-10-26 in a session with Oleh. The work happens in the repo root on `main`, one
general reviewer per commit.

## Agreed with Oleh

- For 3-year-olds: four colours on screen, the game asks for one, and the kid taps it.
- The question is said aloud in Ukrainian and then in English, "Де синій? Where is blue?", with
  the browser's speech synthesis, as in the animal game. The text on screen shows both.
- Twelve everyday colours, no shades: red, orange, yellow, green, light blue, blue, purple, pink,
  brown, black, grey, white.
- The colours are balloons.
- Before the start, a switch picks the language the game speaks and writes in: UA, ENG or
  UA+ENG (the default). The browser remembers it.
- A wrong tap names the colour tapped, then asks again: "Це червоний. Де синій? That's red.
  Where is blue?"
- Without a voice for a language the game asks in, the start screen tells the parent what happens
  instead.
- Oleh listened to the speech: it is fine.

## Decisions

- **Blue and light blue never share a round:** both are "blue" in English.
- **The shades** are bright and far from each other: pink is a soft pink, so it is not taken for
  purple; grey is a middle grey, far from both white and black. The white balloon has a thin dark
  edge, so it shows on the light page.
- **The rounds work as in the animal game,** on the same code (`src/shared/rounds.ts`): every
  colour is asked once before any is asked again, and never twice in a row. No score and no
  losing.
- **A wrong tap:** the balloon shakes, and the game names its colour and asks again.
- **A right tap:** the happy melody, confetti, the balloon flies away and the others fade. Then
  the game names the colour in the language picked, "Так, це синій! Yes, it's blue!" (my
  addition).
  The next four balloons come once the praise is said, and at least 2.6 s after the tap; if a
  voice never says it has finished, the game goes on after 6 s.
- **The 🔊 button** asks the question again.
- **Without a voice for a language** (Ukrainian, likely, on Chrome for Windows), the start screen
  says the game will ask in the other language only, or that the question will only be written,
  and that some devices can add a voice in their settings (Windows has no Ukrainian voice of its
  own). Browsers load their voices in the background, so the notice waits for them, 1.5 s at most
  for a browser that has none, and looks again whenever more voices come.
- **Picking a voice.** The system's default voice of the language when there is one, else the
  first. macOS and iOS list joke and robot voices among the English ones (bells, bubbles, a
  whisper, the old synthesizers); these are skipped. The animal game picks its Ukrainian voice the
  same way.
- **"Grey", not "gray":** Ukrainian schools teach British English; the voice says both alike.
- **Tests.** The e2e tests replace the voices with ones that write down what they are told, so
  they check what the game says.
