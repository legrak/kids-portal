import { useEffect, useState } from "react";
import { HomeButton } from "../../components/HomeButton";
import { celebrate } from "../../shared/celebrate";
import { type GameLanguage, loadLanguage, saveLanguage } from "../../shared/language";
import { type FindGame, nextRound, pickChoice } from "../../shared/rounds";
import { allowSoundWithRingerOff, playSound } from "../../shared/sound";
import { Balloon } from "./components/Balloon";
import { StartScreen } from "./components/StartScreen";
import { CHOICE_COUNT, COLORS, colorById } from "./data/colors";
import { askFor, praise, praiseFor, questionFor, sayWrongPick, stopSpeaking } from "./speech";

const SETTINGS_KEY = "kids-portal.colors.settings";

/** The found balloon flies away for at least this long before the next four come. */
const MIN_FOUND_MS = 2600;
/** A breath between the praise and the next question. */
const PAUSE_AFTER_PRAISE_MS = 400;

/** "Find the colour": four balloons, and the game asks aloud for one of them. */
export function ColorGame() {
  const [language, setLanguage] = useState<GameLanguage>(() => loadLanguage(SETTINGS_KEY));
  const [game, setGame] = useState<FindGame | null>(null);
  const [shakes, setShakes] = useState<Record<string, number>>({});

  useEffect(() => saveLanguage(SETTINGS_KEY, language), [language]);

  // Silence when the kid leaves the game.
  useEffect(() => stopSpeaking, []);

  // The next four come once the balloon has flown and the praise is said in full.
  useEffect(() => {
    if (!game?.round.found) return;
    let flown = false;
    let praised = false;
    // Leaving the game cuts the praise off, which also counts as its end.
    let left = false;
    const goOn = () => {
      if (left || !flown || !praised) return;
      const next = nextRound(COLORS, game, CHOICE_COUNT);
      setGame(next);
      setShakes({});
      askFor(colorById(next.round.target), language);
    };
    let pause = 0;
    const timer = window.setTimeout(() => {
      flown = true;
      goOn();
    }, MIN_FOUND_MS);
    praise(colorById(game.round.target), language, () => {
      pause = window.setTimeout(() => {
        praised = true;
        goOn();
      }, PAUSE_AFTER_PRAISE_MS);
    });
    return () => {
      left = true;
      window.clearTimeout(timer);
      window.clearTimeout(pause);
    };
  }, [game, language]);

  function start() {
    allowSoundWithRingerOff();
    const first = nextRound(COLORS, null, CHOICE_COUNT);
    setGame(first);
    // iOS lets a page speak only once it has spoken inside a tap: this is the tap on Play.
    askFor(colorById(first.round.target), language);
  }

  if (!game) {
    return <StartScreen language={language} onLanguageChange={setLanguage} onStart={start} />;
  }

  const { round } = game;
  const target = colorById(round.target);
  const [main, second] = (round.found ? praiseFor : questionFor)(target, language);

  function pick(id: string) {
    if (!game || round.found) return;
    const picked = pickChoice(round, id);
    if (picked.found) {
      playSound("correct");
      celebrate("answer");
    } else {
      setShakes({ ...shakes, [id]: (shakes[id] ?? 0) + 1 });
      sayWrongPick(colorById(id), target, language);
    }
    setGame({ ...game, round: picked });
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-6xl flex-col gap-3 overflow-hidden px-4 pt-3 pb-4 sm:gap-5">
      {/* Above the found balloon as it flies away, so the praise and the buttons stay in view. */}
      <header className="relative z-10 flex items-center gap-3">
        <HomeButton />
        <div aria-live="polite" className="min-w-0 flex-1 text-center leading-tight">
          <div key={`${round.target}-${round.found}`} className="animate-rise">
            <h1
              lang={main?.lang}
              className="text-[clamp(1.5rem,6.5vw,3.25rem)] font-black text-balance text-violet-900"
            >
              {round.found ? `${main?.text} 🎉` : main?.text}
            </h1>
            {second && (
              <p
                lang={second.lang}
                className="text-[clamp(1.125rem,4.5vw,1.75rem)] font-extrabold text-violet-500"
              >
                {second.text}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => askFor(target, language)}
          disabled={round.found}
          aria-label="Послухати ще раз"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-500 text-2xl text-white shadow-md transition enabled:hover:scale-110 enabled:active:scale-95 disabled:opacity-40"
        >
          🔊
        </button>
      </header>
      <main className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3 landscape:grid-cols-4 landscape:grid-rows-1 sm:gap-5">
        {round.choices.map((id, index) => (
          <BalloonChoice
            key={`${round.target}-${id}`}
            colorId={id}
            place={index + 1}
            state={!round.found ? "asking" : id === round.target ? "found" : "notFound"}
            shakeKey={shakes[id] ?? 0}
            onPick={() => pick(id)}
          />
        ))}
      </main>
    </div>
  );
}

interface BalloonChoiceProps {
  colorId: string;
  /** The balloon's place on the screen, from 1: names it without giving the colour away. */
  place: number;
  state: "asking" | "found" | "notFound";
  /** Changes on every wrong tap on this balloon, to shake it again. */
  shakeKey: number;
  onPick: () => void;
}

/** A balloon to tap. It bobs while the game asks, and the found one flies away. */
function BalloonChoice({ colorId, place, state, shakeKey, onPick }: BalloonChoiceProps) {
  const motion = {
    asking: shakeKey > 0 ? "animate-shake" : "animate-flag-in",
    found: "animate-fly-away",
    notFound: "scale-90 opacity-40 transition duration-500",
  }[state];
  return (
    // Sized to the room the balloon gets, keeping its shape.
    <div className="flex min-h-0 min-w-0 items-center justify-center [container-type:size]">
      <div
        style={{ animationDelay: `${place * 250}ms` }}
        className={state === "asking" ? "animate-float" : ""}
      >
        <div key={shakeKey} className={motion}>
          <button
            type="button"
            onClick={onPick}
            data-color={colorId}
            aria-label={`Кулька ${place}`}
            className="block w-[min(100cqw,66.667cqh)] transition active:scale-95"
          >
            <Balloon color={colorById(colorId).hex} className="w-full drop-shadow-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}
