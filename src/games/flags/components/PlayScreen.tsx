import { type PointerEvent, useEffect, useRef } from "react";
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
  const isOver = isTurnOver(turn);
  const isSolved = isOver && turn.questions.every((q) => q.status === "correct");
  const advanceAfterMs = isSolved ? ADVANCE_AFTER_SOLVED_MS : ADVANCE_AFTER_REVEALED_MS;
  const hint = isOver ? null : nextHint(question, target);
  const turnHints = turn.questions.flatMap(takenHints);
  const showsRegion = turnHints.includes("map") || (isOver && !isSolved);
  const showsUkrainianName = turnHints.includes("ukrainianName");

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
    <div className="flex min-h-dvh flex-col">
      <TopBar
        roundSize={roundCodes.length}
        results={results}
        isAsking={!isOver}
        muted={muted}
        onToggleMute={onToggleMute}
        onMenu={() => dispatch({ type: "openMenu" })}
      />
      <main className="mx-auto grid w-full max-w-2xl flex-1 content-start gap-4 px-4 pt-2 pb-6 sm:gap-6 sm:pt-6 lg:max-w-6xl lg:grid-cols-2 lg:items-start lg:gap-10">
        <section className="flex flex-col items-center gap-3">
          <div
            key={country.code}
            className="w-[min(100%,calc(30dvh*4/3))] sm:w-[min(100%,calc(40dvh*4/3))] animate-flag-in rounded-3xl bg-white p-3 shadow-xl ring-1 ring-violet-100 transition hover:-rotate-1 hover:scale-[1.02] lg:w-full lg:max-w-lg"
          >
            <FlagImage
              code={country.code}
              alt={isOver ? `Прапор: ${country.uk.name}` : "Прапор — вгадай країну"}
            />
          </div>
          {showsRegion && (
            <>
              <p className="animate-rise rounded-full bg-white px-4 py-1 text-lg font-extrabold text-violet-700 shadow-sm">
                📍 {REGION_NAMES[country.region]}
              </p>
              <div className="w-full max-w-lg animate-rise">
                <WorldMap
                  key={country.code}
                  isoNumeric={country.isoNumeric}
                  region={country.region}
                />
              </div>
            </>
          )}
          {showsUkrainianName && (
            <p className="animate-rise rounded-full bg-white px-4 py-1 text-lg font-bold text-slate-700 shadow-sm">
              💬 Українською: <b>{country.uk.name}</b>
            </p>
          )}
        </section>

        <section className="flex flex-col items-center gap-3">
          {isOver ? (
            <ResultBanner
              turn={turn}
              stars={starsForTurn(turn)}
              praise={praiseFor(results.length)}
              advanceAfterMs={advanceAfterMs}
              onNext={() => dispatch({ type: "next" })}
            />
          ) : (
            <Prompt turn={turn} question={question} />
          )}
          <AnswerField
            question={question}
            target={target}
            language={language}
            isOver={isOver}
            mistakeText={mistakeText(question)}
            inputRef={inputRef}
            onTypeText={typeText}
            onSubmit={submitOrGoOn}
          />
          {!isOver && (
            <div className="grid w-full grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => dispatch({ type: "submit" })}
                onPointerDown={keepFocus}
                className="col-span-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-3 text-xl font-extrabold text-white shadow-md transition hover:bg-emerald-400 active:translate-y-0.5 active:border-b-2"
              >
                ✓ Перевірити
              </button>
              <button
                type="button"
                disabled={!hint}
                onClick={() => dispatch({ type: "hint" })}
                onPointerDown={keepFocus}
                className="rounded-2xl border-b-4 border-amber-500 bg-amber-300 px-2 py-3 font-extrabold text-amber-950 shadow-md transition enabled:hover:bg-amber-200 enabled:active:translate-y-0.5 enabled:active:border-b-2 disabled:opacity-50 sm:text-lg"
              >
                {hint
                  ? `${HINT_EMOJI[hint]} ${hintLabel(hint, question.revealedLetters)}`
                  : "💡 Підказок нема"}
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "giveUp" })}
                onPointerDown={keepFocus}
                className="rounded-2xl border-b-4 border-slate-300 bg-white px-2 py-3 font-bold text-slate-600 shadow-md transition hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 sm:text-lg"
              >
                🤷 Не знаю
              </button>
            </div>
          )}
          {!isOver && (
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

function Prompt({ turn, question }: { turn: Turn; question: Question }) {
  if (question.kind === "capital") {
    return (
      <div className="flex animate-rise flex-col items-center gap-1 text-center">
        <p className="rounded-full bg-emerald-100 px-4 py-1 font-extrabold text-emerald-700">
          ✓ {turn.country.uk.name}
        </p>
        <h1 className="text-3xl font-extrabold text-violet-900">А яка столиця?</h1>
      </div>
    );
  }
  return (
    <div className="text-center">
      <h1 className="text-3xl font-extrabold text-violet-900">
        {question.kind === "countryEnglish" ? "What country is this?" : "Яка це країна?"}
      </h1>
      {question.kind === "countryEnglish" && (
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
