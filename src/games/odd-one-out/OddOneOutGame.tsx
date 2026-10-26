import { useEffect, useState } from "react";
import { HomeButton } from "../../components/HomeButton";
import { celebrate } from "../../shared/celebrate";
import { type GameLanguage, loadLanguage, saveLanguage } from "../../shared/language";
import { pickChoice } from "../../shared/rounds";
import { allowSoundWithRingerOff, playSound } from "../../shared/sound";
import type { Phrase } from "../../shared/speech";
import { PictureCard } from "./components/PictureCard";
import { StartScreen } from "./components/StartScreen";
import { categoryById, pictureUrl, THINGS, thingById } from "./data/things";
import { nextRound, type OddGame } from "./rounds";
import { ask, explain, explanationFor, questionFor, sayWrongPick, stopSpeaking } from "./speech";

const SETTINGS_KEY = "kids-portal.odd-one-out.settings";

/** The found picture stays in view for at least this long before the next four come. */
const MIN_FOUND_MS = 2600;
/** A breath between the explanation and the next question. */
const PAUSE_AFTER_EXPLANATION_MS = 400;

/** "Find the odd one out": three pictures of one category and one of another. */
export function OddOneOutGame() {
  const [language, setLanguage] = useState<GameLanguage>(() => loadLanguage(SETTINGS_KEY));
  const [game, setGame] = useState<OddGame | null>(null);
  const [shakes, setShakes] = useState<Record<string, number>>({});

  useEffect(() => saveLanguage(SETTINGS_KEY, language), [language]);

  // Silence when the kid leaves the game.
  useEffect(() => stopSpeaking, []);

  // The next four come once the explanation is said in full.
  useEffect(() => {
    if (!game?.round.found) return;
    const next = nextRound(THINGS, game);
    // Its pictures load while the explanation is said.
    for (const id of next.round.choices) new Image().src = pictureUrl(id);
    let shown = false;
    let explained = false;
    // Leaving the game cuts the explanation off, which also counts as its end.
    let left = false;
    const goOn = () => {
      if (left || !shown || !explained) return;
      setGame(next);
      setShakes({});
      ask(language);
    };
    let pause = 0;
    const timer = window.setTimeout(() => {
      shown = true;
      goOn();
    }, MIN_FOUND_MS);
    explain(categoryById(game.round.group), thingById(game.round.target), language, () => {
      pause = window.setTimeout(() => {
        explained = true;
        goOn();
      }, PAUSE_AFTER_EXPLANATION_MS);
    });
    return () => {
      left = true;
      window.clearTimeout(timer);
      window.clearTimeout(pause);
    };
  }, [game, language]);

  function start() {
    allowSoundWithRingerOff();
    setGame(nextRound(THINGS, null));
    // iOS lets a page speak only once it has spoken inside a tap: this is the tap on Play.
    ask(language);
  }

  if (!game) {
    return <StartScreen language={language} onLanguageChange={setLanguage} onStart={start} />;
  }

  const { round } = game;

  function pick(id: string) {
    if (!game || round.found) return;
    const picked = pickChoice(round, id);
    if (picked.found) {
      playSound("correct");
      celebrate("answer");
    } else {
      setShakes({ ...shakes, [id]: (shakes[id] ?? 0) + 1 });
      sayWrongPick(thingById(id), language);
    }
    setGame({ ...game, round: picked });
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-6xl flex-col gap-3 overflow-hidden px-4 pt-3 pb-4 sm:gap-5">
      <header className="relative z-10 flex items-center gap-3">
        <HomeButton />
        {/*
          The question and the explanation take the same place, the one not said invisible: the
          header keeps the height of the taller, so the cards don't move under the kid's finger.
        */}
        <div
          aria-live="polite"
          className="grid min-w-0 flex-1 text-center leading-tight [container-type:inline-size]"
        >
          <Caption
            key={`${round.target}-question`}
            phrases={questionFor(language)}
            shown={!round.found}
          />
          <Caption
            key={`${round.target}-explanation`}
            phrases={explanationFor(categoryById(round.group), thingById(round.target), language)}
            shown={round.found}
            explains
          />
        </div>
        <button
          type="button"
          onClick={() => ask(language)}
          disabled={round.found}
          aria-label="Послухати ще раз"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-500 text-2xl text-white shadow-md transition enabled:hover:scale-110 enabled:active:scale-95 disabled:opacity-40"
        >
          🔊
        </button>
      </header>
      {/*
        The cards are squares as big as the room allows, together in the middle: two by two, or
        four in a row when the room is more than twice as wide as it is high.
      */}
      <main className="min-h-0 flex-1 [container-type:size]">
        <div className="grid h-full grid-cols-[repeat(2,var(--side))] auto-rows-(--side) place-content-center gap-(--gap) [--gap:0.75rem] [--side:min((100cqw_-_var(--gap))/2,(100cqh_-_var(--gap))/2)] sm:[--gap:1.25rem] [@container(min-aspect-ratio:2/1)]:grid-cols-[repeat(4,var(--side))] [@container(min-aspect-ratio:2/1)]:[--side:min((100cqw_-_3*var(--gap))/4,100cqh)]">
          {round.choices.map((id, index) => (
            <PictureCard
              key={`${round.target}-${id}`}
              thingId={id}
              place={index + 1}
              state={!round.found ? "asking" : id === round.target ? "odd" : "group"}
              shakeKey={shakes[id] ?? 0}
              onPick={() => pick(id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

interface CaptionProps {
  /** The Ukrainian and the English one, or one of them. */
  phrases: Phrase[];
  shown: boolean;
  /**
   * The explanation: smaller letters that grow with the width, so each phrase takes one line on a
   * wide screen.
   */
  explains?: boolean;
}

/** What the game says, written above the cards. */
function Caption({ phrases: [main, second], shown, explains = false }: CaptionProps) {
  return (
    <div
      className={`flex flex-col justify-center [grid-area:1/1] ${shown ? "animate-rise" : "invisible"}`}
    >
      <h1
        lang={main?.lang}
        className={`font-black text-balance text-violet-900 ${
          explains ? "text-[clamp(1rem,2.5cqw,2rem)]" : "text-[clamp(1.5rem,6.5vw,3.25rem)]"
        }`}
      >
        {explains ? `${main?.text} 🎉` : main?.text}
      </h1>
      {second && (
        <p
          lang={second.lang}
          className={`font-extrabold text-balance text-violet-500 ${
            explains ? "text-[clamp(0.875rem,2cqw,1.5rem)]" : "text-[clamp(1.125rem,4.5vw,1.75rem)]"
          }`}
        >
          {second.text}
        </p>
      )}
    </div>
  );
}
