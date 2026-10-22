import {
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { MAX_ANSWER_LENGTH, type Question } from "../logic/game";
import {
  hasLettersOfOtherAlphabet,
  type KeyboardLanguage,
  remapPhysicalKey,
} from "../logic/keyboardLayouts";
import { type SlotCell, slotCells } from "../logic/slots";

interface AnswerFieldProps {
  question: Question;
  /** The main answer, laid out in the letter slots. */
  target: string;
  language: KeyboardLanguage;
  /**
   * The turn is over and its result is on screen. The field hides. On a touch screen it also
   * loses the focus, so the keyboard closes and the result and the next flag are in full view; on
   * a computer it keeps the focus (the game ignores typing meanwhile).
   */
  isOver: boolean;
  /** Text shown under the field after a wrong answer. */
  mistakeText: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onTypeText: (text: string) => void;
  onSubmit: () => void;
}

/** Long words break into rows of at most this many slots, so the slots stay readable on a phone. */
const MAX_SLOTS_PER_ROW = 13;
/** How far a row break may move to land right after a hyphen. */
const HYPHEN_SNAP = 3;

const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;

/**
 * The answer as a real text field, so phones and tablets open their own keyboard. With the
 * letter-slots hint on, the field becomes invisible over the slots and keeps taking the typing.
 */
export function AnswerField({
  question,
  target,
  language,
  isOver,
  mistakeText,
  inputRef,
  onTypeText,
  onSubmit,
}: AnswerFieldProps) {
  const caretAfterRemap = useRef<number | null>(null);
  const shaking = useShakeOnMistake(question.mistake);

  useLayoutEffect(() => {
    const caret = caretAfterRemap.current;
    if (caret === null) return;
    caretAfterRemap.current = null;
    inputRef.current?.setSelectionRange(caret, caret);
  });

  // On a computer the field always has the focus, so typing just works. On a touch screen the
  // kid taps the field: focusing it from code would not open the keyboard anyway.
  useEffect(() => {
    if (!isTouchDevice()) inputRef.current?.focus({ preventScroll: true });
  });

  useEffect(() => {
    if (isOver && isTouchDevice()) inputRef.current?.blur();
  }, [isOver, inputRef]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (isOver || event.ctrlKey || event.metaKey || event.altKey) return;
    const letter = remapPhysicalKey(language, event.key, event.code);
    if (!letter) return;
    event.preventDefault();
    const input = event.currentTarget;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    caretAfterRemap.current = start + letter.length;
    onTypeText(input.value.slice(0, start) + letter + input.value.slice(end));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  const cells = question.showsSlots
    ? slotCells(target, question.revealedLetters, question.typed)
    : null;
  const wrongKeyboard = hasLettersOfOtherAlphabet(language, question.typed);

  return (
    <form
      onSubmit={handleSubmit}
      className={isOver ? "sr-only" : "flex w-full flex-col items-center gap-1"}
    >
      <div className={`relative w-full @container ${shaking ? "animate-shake" : ""}`}>
        {cells && <LetterSlots cells={cells} hasMistake={question.mistake !== null} />}
        <input
          ref={inputRef}
          value={question.typed}
          onChange={(event) => onTypeText(event.target.value)}
          onKeyDown={handleKeyDown}
          // The letters fill the slots in order, so with slots on the caret stays at the end.
          onSelect={cells ? (event) => moveCaretToEnd(event.currentTarget) : undefined}
          onBlur={(event) => {
            // On a computer, clicking the page must not stop the typing.
            if (!isTouchDevice() && !event.relatedTarget) {
              requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
            }
          }}
          lang={language}
          aria-label={language === "en" ? "Відповідь англійською" : "Відповідь"}
          placeholder={cells ? undefined : "Напиши назву…"}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={MAX_ANSWER_LENGTH}
          className={
            cells
              ? "absolute inset-0 h-full w-full cursor-pointer bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent"
              : `h-16 w-full rounded-2xl border-4 bg-white px-4 text-center text-2xl font-extrabold tracking-wide uppercase shadow-inner outline-none transition placeholder:font-semibold placeholder:normal-case placeholder:text-slate-400 sm:text-3xl ${
                  question.mistake
                    ? "border-rose-300 focus:border-rose-400"
                    : "border-violet-200 focus:border-violet-400"
                }`
          }
        />
      </div>
      <p aria-live="polite" className="text-center font-bold text-rose-500 empty:hidden">
        {mistakeText ??
          (wrongKeyboard
            ? language === "uk"
              ? "Здається, клавіатура англійська 🌐 Перемкни на українську"
              : "Здається, клавіатура українська 🌐 Перемкни на англійську"
            : "")}
      </p>
    </form>
  );
}

function moveCaretToEnd(input: HTMLInputElement) {
  const end = input.value.length;
  if (input.selectionStart !== end || input.selectionEnd !== end) input.setSelectionRange(end, end);
}

/** True for the length of the shake animation after each new wrong answer. */
function useShakeOnMistake(mistake: Question["mistake"]): boolean {
  const [shaking, setShaking] = useState(false);
  useEffect(() => {
    if (!mistake) return;
    setShaking(true);
    const timer = window.setTimeout(() => setShaking(false), 500);
    return () => window.clearTimeout(timer);
  }, [mistake]);
  return shaking;
}

interface NumberedCell {
  cell: SlotCell;
  index: number;
}

/** The cells of one word, in one or more rows that stack under each other. */
type SlotWord = NumberedCell[][];

/** Cuts a long word into rows of about equal length, each break right after a hyphen if one is near. */
function splitLongWord(word: NumberedCell[]): SlotWord {
  const rowCount = Math.ceil(word.length / MAX_SLOTS_PER_ROW);
  const rows: SlotWord = [];
  let start = 0;
  for (let row = 1; row < rowCount; row++) {
    const even = Math.round((word.length * row) / rowCount);
    const afterHyphen = word.findIndex(
      ({ cell }, i) =>
        Math.abs(i + 1 - even) <= HYPHEN_SNAP && cell.kind === "separator" && cell.char === "-",
    );
    const end = afterHyphen === -1 ? even : afterHyphen + 1;
    rows.push(word.slice(start, end));
    start = end;
  }
  rows.push(word.slice(start));
  return rows;
}

/** Splits the cells into words at spaces, and long words into rows. */
function slotWords(cells: SlotCell[]): SlotWord[] {
  const words: NumberedCell[][] = [[]];
  cells.forEach((cell, index) => {
    if (cell.kind === "separator" && cell.char.trim() === "") words.push([]);
    else words[words.length - 1]?.push({ cell, index });
  });
  return words.filter((word) => word.length > 0).map(splitLongWord);
}

function LetterSlots({ cells, hasMistake }: { cells: SlotCell[]; hasMistake: boolean }) {
  const words = slotWords(cells);
  const widestRow = Math.max(...words.flat().map((row) => row.length));
  // Sized by the field's own width (container units), so the slots fit a phone and a half-screen
  // column alike.
  const cellWidth = `min(2.75rem, calc(100cqw / ${widestRow} - 0.25rem))`;
  const firstEmpty = cells.findIndex((cell) => cell.kind === "empty");

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 py-1" aria-hidden="true">
      {words.map((rows) => (
        <div key={rows[0]?.[0]?.index} className="flex flex-col items-center gap-y-2">
          {rows.map((row) => (
            <div key={row[0]?.index} className="flex gap-1">
              {row.map(({ cell, index }) => (
                <SlotBox
                  key={index}
                  cell={cell}
                  width={cellWidth}
                  isNext={index === firstEmpty}
                  hasMistake={hasMistake}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SlotBox({
  cell,
  width,
  isNext,
  hasMistake,
}: {
  cell: SlotCell;
  width: string;
  isNext: boolean;
  hasMistake: boolean;
}) {
  if (cell.kind === "separator") {
    return (
      <span className="flex items-end pb-2 text-2xl font-extrabold text-slate-400">
        {cell.char}
      </span>
    );
  }
  const colors = {
    revealed: "border-amber-400 bg-amber-100 text-amber-700",
    typed: hasMistake
      ? "border-rose-400 bg-white text-rose-600"
      : "animate-pop border-violet-400 bg-white text-violet-700",
    empty: isNext
      ? "animate-pulse border-violet-500 bg-violet-50"
      : "border-dashed border-violet-300 bg-white/70",
  }[cell.kind];
  return (
    <span
      style={{ width, fontSize: `calc(${width} * 0.62)` }}
      className={`flex aspect-4/5 items-center justify-center rounded-lg border-2 border-b-4 font-extrabold uppercase shadow-sm ${colors}`}
    >
      {cell.kind === "empty" ? "" : cell.char}
    </span>
  );
}
