import { type PointerEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HINT_EMOJI, hintLabel, praiseFor, REGION_NAMES } from "../labels";
import {
  countryByCode,
  type FlagResult,
  type GameAction,
  isTurnOver,
  nextHint,
  type Question,
  starsForTurn,
  type Turn,
  takenHints,
  targetAnswer,
} from "../logic/game";
import { AnswerField } from "./AnswerField";
import { ChoiceOptions } from "./ChoiceOptions";
import { FlagImage, preloadFlag } from "./FlagImage";
import { OnScreenKeyboard } from "./OnScreenKeyboard";
import { ResultBanner } from "./ResultBanner";
import { TopBar } from "./TopBar";
import { WorldMap } from "./WorldMap";

/** Keeps the focus in the answer field, so a phone keyboard stays open while buttons are tapped. */
const keepFocus = (event: PointerEvent) => event.preventDefault();

/** Enter cannot skip a result shown for less than this. */
const RESULT_MIN_SHOWN_MS = 700;

/** How long the result stays on screen before the next flag. */
const ADVANCE_AFTER_SOLVED_MS = 2600;
/** Longer after a revealed answer, to read it and see the country on the map. */
const ADVANCE_AFTER_REVEALED_MS = 5000;

interface PlayScreenProps {
  turn: Turn;
  roundCodes: readonly string[];
  results: readonly FlagResult[];
  muted: boolean;
  onToggleMute: () => void;
  dispatch: (action: GameAction) => void;
}

export function PlayScreen({
  turn,
  roundCodes,
  results,
  muted,
  onToggleMute,
  dispatch,
}: PlayScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { country } = turn;
  const question = turn.questions[turn.current] as Question;
  const target = targetAnswer(country, question.kind);
  const language = question.kind === "countryEnglish" ? "en" : "uk";
  const isChoice = question.kind === "countryChoice";
  const isOver = isTurnOver(turn);
  const isSolved = isOver && turn.questions.every((q) => q.status === "correct");
  const advanceAfterMs = isSolved ? ADVANCE_AFTER_SOLVED_MS : ADVANCE_AFTER_REVEALED_MS;
  const hint = isOver ? null : nextHint(question, target);
  const turnHints = turn.questions.flatMap(takenHints);
  const showsRegion = turnHints.includes("map") || (isOver && !isSolved);
  const showsUkrainianName = turnHints.includes("ukrainianName");
  // While the kid types on a touch screen, its keyboard covers part of it: the screen then fits
  // the flag, the answer field and the buttons into the part left in view.
  const [isTouchTyping, setTouchTyping] = useState(false);
  const areaAboveKeyboard = useAreaAboveKeyboard(isTouchTyping);
  const isCompact = areaAboveKeyboard !== null;

  useEffect(() => {
    if (!isOver) return;
    const timer = window.setTimeout(() => dispatch({ type: "next" }), advanceAfterMs);
    return () => window.clearTimeout(timer);
  }, [isOver, advanceAfterMs, dispatch]);

  const nextCode = roundCodes[results.length + (isOver ? 0 : 1)];
  useEffect(() => {
    if (nextCode) preloadFlag(nextCode);
  }, [nextCode]);

  const typeText = (text: string) => dispatch({ type: "typeText", text });
  // Enter checks the answer, and goes on once the result is shown; an Enter pressed right after
  // the answer (twice, or held down) must not skip the result.
  const overSince = useRef(0);
  useEffect(() => {
    if (isOver) overSince.current = Date.now();
  }, [isOver]);
  const submitOrGoOn = () => {
    if (!isOver) dispatch({ type: "submit" });
    else if (Date.now() - overSince.current > RESULT_MIN_SHOWN_MS) dispatch({ type: "next" });
  };

  return (
    <div
      className={
        isCompact ? "fixed inset-x-0 flex flex-col overflow-y-auto" : "flex min-h-dvh flex-col"
      }
      style={areaAboveKeyboard ?? undefined}
    >
      {!isCompact && (
        <TopBar
          roundSize={roundCodes.length}
          results={results}
          isAsking={!isOver}
          muted={muted}
          onToggleMute={onToggleMute}
          onMenu={() => dispatch({ type: "openMenu" })}
        />
      )}
      <main
        className={
          isCompact
            ? // In landscape the flag goes beside the answer: a phone has little height left then.
              "mx-auto grid min-h-0 w-full max-w-2xl flex-1 grid-rows-[minmax(5rem,1fr)_auto] gap-2 px-4 py-2 landscape:max-w-6xl landscape:grid-cols-2 landscape:grid-rows-[minmax(5rem,1fr)] landscape:gap-6"
            : "mx-auto grid w-full max-w-2xl flex-1 content-start gap-4 px-4 pt-2 pb-6 sm:gap-6 sm:pt-6 lg:max-w-6xl lg:grid-cols-2 lg:items-start lg:gap-10"
        }
      >
        <section className={`flex flex-col items-center ${isCompact ? "min-h-0 gap-2" : "gap-3"}`}>
          <div
            className={
              isCompact
                ? "flex min-h-0 w-full flex-1 items-center justify-center [container-type:size]"
                : "contents"
            }
          >
            <div
              key={country.code}
              className={`animate-flag-in rounded-3xl bg-white p-3 shadow-xl ring-1 ring-violet-100 transition hover:-rotate-1 hover:scale-[1.02] ${
                isCompact
                  ? // As wide as the room allows, keeping the card (a 4:3 flag plus padding) in it.
                    "w-[min(100cqw,calc((100cqh_-_1.5rem)*4/3_+_1.5rem))]"
                  : "w-[min(100%,calc(30dvh*4/3))] sm:w-[min(100%,calc(40dvh*4/3))] lg:w-full lg:max-w-lg"
              }`}
            >
              <FlagImage
                code={country.code}
                alt={isOver ? `Прапор: ${country.uk.name}` : "Прапор — вгадай країну"}
              />
            </div>
          </div>
          {showsRegion && (
            <>
              <p
                className={`animate-rise rounded-full bg-white px-4 font-extrabold text-violet-700 shadow-sm ${isCompact ? "py-0.5" : "py-1 text-lg"}`}
              >
                📍 {REGION_NAMES[country.region]}
              </p>
              {/* No room for the map above a phone keyboard; it stays mounted for later. */}
              <div className={isCompact ? "hidden" : "w-full max-w-lg animate-rise"}>
                <WorldMap
                  key={country.code}
                  isoNumeric={country.isoNumeric}
                  region={country.region}
                />
              </div>
            </>
          )}
          {showsUkrainianName && (
            <p
              className={`animate-rise rounded-full bg-white px-4 font-bold text-slate-700 shadow-sm ${isCompact ? "py-0.5" : "py-1 text-lg"}`}
            >
              💬 Українською: <b>{country.uk.name}</b>
            </p>
          )}
        </section>

        <section
          className={`flex flex-col items-center ${isCompact ? "gap-2 landscape:justify-center" : "gap-3"}`}
        >
          {isOver ? (
            <ResultBanner
              turn={turn}
              stars={starsForTurn(turn)}
              praise={praiseFor(results.length)}
              advanceAfterMs={advanceAfterMs}
              onNext={() => dispatch({ type: "next" })}
            />
          ) : (
            <Prompt turn={turn} question={question} compact={isCompact} />
          )}
          {isChoice ? (
            !isOver && (
              <ChoiceOptions
                question={question}
                mistakeText={mistakeText(question)}
                onPick={(code) => dispatch({ type: "pick", code })}
              />
            )
          ) : (
            <AnswerField
              question={question}
              target={target}
              language={language}
              isOver={isOver}
              mistakeText={mistakeText(question)}
              inputRef={inputRef}
              onTypeText={typeText}
              onSubmit={submitOrGoOn}
              onTouchTypingChange={setTouchTyping}
            />
          )}
          {!isOver && (
            <div
              className={`grid w-full gap-2 ${isCompact ? "grid-cols-3 leading-tight" : "grid-cols-2"}`}
            >
              {!isChoice && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "submit" })}
                  onPointerDown={keepFocus}
                  className={`rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 font-extrabold text-white shadow-md transition hover:bg-emerald-400 active:translate-y-0.5 active:border-b-2 ${isCompact ? "py-2" : "col-span-2 py-3 text-xl"}`}
                >
                  ✓ Перевірити
                </button>
              )}
              <button
                type="button"
                disabled={!hint}
                onClick={() => {
                  dispatch({ type: "hint" });
                  // The map needs the room the phone keyboard takes, so the keyboard closes.
                  if (hint === "map" && isCompact) inputRef.current?.blur();
                }}
                onPointerDown={keepFocus}
                className={`rounded-2xl border-b-4 border-amber-500 bg-amber-300 px-2 font-extrabold text-amber-950 shadow-md transition enabled:hover:bg-amber-200 enabled:active:translate-y-0.5 enabled:active:border-b-2 disabled:opacity-50 ${isCompact ? "py-2" : "py-3 sm:text-lg"}`}
              >
                {hint
                  ? `${HINT_EMOJI[hint]} ${hintLabel(hint, question.revealedLetters)}`
                  : "💡 Підказок нема"}
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "giveUp" })}
                onPointerDown={keepFocus}
                className={`rounded-2xl border-b-4 border-slate-300 bg-white px-2 font-bold text-slate-600 shadow-md transition hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 ${isCompact ? "py-2" : "py-3 sm:text-lg"}`}
              >
                🤷 Не знаю
              </button>
            </div>
          )}
          {!isOver && !isChoice && (
            <OnScreenKeyboard
              language={language}
              onKey={(char) => typeText(question.typed + char)}
              onBackspace={() => typeText(Array.from(question.typed).slice(0, -1).join(""))}
              onEnter={submitOrGoOn}
            />
          )}
        </section>
      </main>
    </div>
  );
}

interface ScreenArea {
  top: number;
  height: number;
}

/** A visible part this much shorter than the page means a device keyboard covers the rest. */
const MIN_KEYBOARD_HEIGHT = 120;

/**
 * The part of the page in view above a device keyboard, or null while no keyboard is open (it
 * hides, say, with Android's Back while the field keeps the focus). Watched while `typing`.
 */
function useAreaAboveKeyboard(typing: boolean): ScreenArea | null {
  const [area, setArea] = useState<ScreenArea | null>(null);
  useLayoutEffect(() => {
    const viewport = window.visualViewport;
    if (!typing || !viewport) return;
    const update = () => {
      const keyboardHeight = window.innerHeight - viewport.height * viewport.scale;
      setArea(
        keyboardHeight > MIN_KEYBOARD_HEIGHT
          ? { top: viewport.offsetTop, height: viewport.height }
          : null,
      );
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [typing]);
  return typing ? area : null;
}

interface PromptProps {
  turn: Turn;
  question: Question;
  /** Shorter, to leave room for the flag above a phone keyboard. */
  compact: boolean;
}

function Prompt({ turn, question, compact }: PromptProps) {
  const headingClass = `${compact ? "text-lg" : "text-3xl"} font-extrabold text-violet-900`;
  if (question.kind === "capital") {
    return (
      <div className="flex animate-rise flex-col items-center gap-1 text-center">
        {!compact && (
          <p className="rounded-full bg-emerald-100 px-4 py-1 font-extrabold text-emerald-700">
            ✓ {turn.country.uk.name}
          </p>
        )}
        <h1 className={headingClass}>А яка столиця?</h1>
      </div>
    );
  }
  // The question is plain by now; the flag gets the room.
  if (compact && question.kind === "country") return null;
  return (
    <div className="text-center">
      <h1 className={headingClass}>
        {question.kind === "countryEnglish" ? "What country is this?" : "Яка це країна?"}
      </h1>
      {question.kind === "countryEnglish" && !compact && (
        <p className="font-bold text-slate-500">Напиши назву англійською</p>
      )}
    </div>
  );
}

function mistakeText(question: Question): string | null {
  const mistake = question.mistake;
  if (!mistake) return null;
  if (mistake.kind === "wrong") return "Не зовсім. Спробуй ще! 💪";
  const other = countryByCode(mistake.code);
  if (question.kind === "capital") {
    return `${other.uk.capital} — столиця країни ${other.uk.name}. Спробуй ще!`;
  }
  const otherName = question.kind === "countryEnglish" ? other.en.name : other.uk.name;
  return `Ні, це не ${otherName}. Спробуй ще!`;
}
