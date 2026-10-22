import { COUNTRIES, type Country } from "../data/countries";
import { type AnswerMatch, matchAnswer, type NamedOption, normalizeAnswer } from "./answers";
import type { PoolSettings } from "./pool";
import { cellsToText, fitToSlots, isComplete, letterCount, slotCells } from "./slots";

/** What the kid answers: the country name, the name and the capital, or the English name. */
export type GameMode = "country" | "countryAndCapital" | "english";

export interface GameSettings extends PoolSettings {
  mode: GameMode;
}

export const ROUND_SIZE = 10;

/** Longer than any name, so a stuck key cannot grow the answer without end. */
export const MAX_ANSWER_LENGTH = 40;

export type QuestionKind = "country" | "countryEnglish" | "capital";

/**
 * Hints, each one easier than the one before. The last one repeats: every time it shows one more
 * letter.
 */
export type HintKind = "map" | "ukrainianName" | "slots" | "letter";

const HINT_LADDERS: Record<QuestionKind, readonly HintKind[]> = {
  country: ["map", "slots", "letter"],
  countryEnglish: ["map", "ukrainianName", "slots", "letter"],
  capital: ["slots", "letter"],
};

export interface Question {
  kind: QuestionKind;
  /** What the kid has typed; with slots on, only the letters of the slots still to fill. */
  typed: string;
  hintsUsed: number;
  showsSlots: boolean;
  revealedLetters: number;
  status: "asking" | "correct" | "revealed";
  /** The last wrong answer the kid checked, cleared as they type again. */
  mistake: Extract<AnswerMatch, { kind: "other" | "wrong" }> | null;
  /** Set when the answer was accepted with a typo, to show the right spelling. */
  acceptedWithTypo: boolean;
}

export interface Turn {
  country: Country;
  questions: Question[];
  /** Index of the question being asked; stays on the question the turn ended on. */
  current: number;
}

export type Stars = 0 | 1 | 2 | 3;

export interface FlagResult {
  code: string;
  stars: Stars;
}

export interface GameState {
  screen: "menu" | "playing" | "summary";
  settings: GameSettings;
  /** Codes of the countries not shown yet in this game, in the order they will come. */
  upcoming: string[];
  roundCodes: string[];
  /** Results of the finished turns of the round. */
  results: FlagResult[];
  turn: Turn | null;
}

export type GameAction =
  | { type: "start"; settings: GameSettings; deck: string[] }
  | { type: "typeText"; text: string }
  | { type: "submit" }
  | { type: "hint" }
  | { type: "giveUp" }
  | { type: "next" }
  | { type: "nextRound" }
  | { type: "replay"; deck: string[] }
  | { type: "openMenu" };

const COUNTRIES_BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]));

export function countryByCode(code: string): Country {
  const country = COUNTRIES_BY_CODE.get(code);
  if (!country) throw new Error(`Unknown country code: ${code}`);
  return country;
}

export function initialGameState(settings: GameSettings): GameState {
  return { screen: "menu", settings, upcoming: [], roundCodes: [], results: [], turn: null };
}

function questionKinds(mode: GameMode): QuestionKind[] {
  if (mode === "english") return ["countryEnglish"];
  if (mode === "countryAndCapital") return ["country", "capital"];
  return ["country"];
}

function newQuestion(kind: QuestionKind): Question {
  return {
    kind,
    typed: "",
    hintsUsed: 0,
    showsSlots: false,
    revealedLetters: 0,
    status: "asking",
    mistake: null,
    acceptedWithTypo: false,
  };
}

function newTurn(code: string, mode: GameMode): Turn {
  return {
    country: countryByCode(code),
    questions: questionKinds(mode).map(newQuestion),
    current: 0,
  };
}

/** The main answer for a question: shown after the answer and laid out in the letter slots. */
export function targetAnswer(country: Country, kind: QuestionKind): string {
  if (kind === "countryEnglish") return country.en.name;
  if (kind === "capital") return country.uk.capital;
  return country.uk.name;
}

function acceptedAnswers(country: Country, kind: QuestionKind): string[] {
  if (kind === "countryEnglish") return [country.en.name, ...(country.en.aliases ?? [])];
  if (kind === "capital") return [country.uk.capital, ...(country.uk.capitalAliases ?? [])];
  return [country.uk.name, ...(country.uk.aliases ?? [])];
}

function otherAnswers(country: Country, kind: QuestionKind): NamedOption[] {
  return COUNTRIES.filter((other) => other.code !== country.code).map((other) => ({
    code: other.code,
    names: acceptedAnswers(other, kind),
  }));
}

/** The hint the kid gets next, or null when no hint is left. */
export function nextHint(question: Question, target: string): HintKind | null {
  const ladder = HINT_LADDERS[question.kind];
  const hint = ladder[Math.min(question.hintsUsed, ladder.length - 1)] ?? null;
  // The last letter is always left for the kid to type.
  if (hint === "letter" && question.revealedLetters >= letterCount(target) - 1) return null;
  return hint;
}

/** Hints already taken, in the order they were taken. */
export function takenHints(question: Question): HintKind[] {
  const ladder = HINT_LADDERS[question.kind];
  return Array.from(
    { length: question.hintsUsed },
    (_, i) => ladder[Math.min(i, ladder.length - 1)] as HintKind,
  );
}

export function isTurnOver(turn: Turn): boolean {
  return (
    turn.questions.some((q) => q.status === "revealed") ||
    turn.questions.every((q) => q.status === "correct")
  );
}

export function starsForTurn(turn: Turn): Stars {
  const [first] = turn.questions;
  if (turn.questions.some((q) => q.status === "revealed")) {
    return first?.status === "correct" ? 1 : 0;
  }
  const hintsUsed = turn.questions.reduce((sum, q) => sum + q.hintsUsed, 0);
  if (hintsUsed === 0) return 3;
  if (hintsUsed <= 2) return 2;
  return 1;
}

function currentQuestion(turn: Turn): Question {
  const question = turn.questions[turn.current];
  if (!question) throw new Error("A turn always has a current question");
  return question;
}

function withQuestion(turn: Turn, question: Question): Turn {
  return { ...turn, questions: turn.questions.map((q, i) => (i === turn.current ? question : q)) };
}

/** The answer as the kid has it now: the free text, or the letters in the slots. */
export function currentAnswerText(turn: Turn): string {
  const question = currentQuestion(turn);
  if (!question.showsSlots) return question.typed;
  const target = targetAnswer(turn.country, question.kind);
  return cellsToText(slotCells(target, question.revealedLetters, question.typed));
}

function checkAnswer(state: GameState, turn: Turn): GameState {
  const question = currentQuestion(turn);
  const answer = currentAnswerText(turn);
  if (normalizeAnswer(answer) === "") return state;

  const accepted = acceptedAnswers(turn.country, question.kind);
  const others = otherAnswers(turn.country, question.kind);
  const match = matchAnswer(answer, accepted, others);
  if (match.kind === "other" || match.kind === "wrong") {
    // With slots on, a kid who typed another country's whole name after a revealed letter
    // still hears which country that is.
    const typedMatch = question.showsSlots ? matchAnswer(question.typed, accepted, others) : match;
    const mistake = typedMatch.kind === "other" ? typedMatch : match;
    return { ...state, turn: withQuestion(turn, { ...question, mistake }) };
  }

  const answered = withQuestion(turn, {
    ...question,
    status: "correct",
    mistake: null,
    acceptedWithTypo: match.kind === "typo",
  });
  const hasNextQuestion = answered.current < answered.questions.length - 1;
  if (hasNextQuestion) return { ...state, turn: { ...answered, current: answered.current + 1 } };
  return finishTurn(state, answered);
}

function finishTurn(state: GameState, turn: Turn): GameState {
  return {
    ...state,
    turn,
    results: [...state.results, { code: turn.country.code, stars: starsForTurn(turn) }],
  };
}

function startRound(state: GameState, roundCodes: string[], upcoming: string[]): GameState {
  const [firstCode] = roundCodes;
  if (!firstCode) return { ...state, screen: "menu", turn: null };
  return {
    ...state,
    screen: "playing",
    upcoming,
    roundCodes,
    results: [],
    turn: newTurn(firstCode, state.settings.mode),
  };
}

/**
 * Puts the changed question into the turn. With the slots on, slots that this change filled up
 * are checked at once, so there is nothing to press.
 */
function updateQuestion(
  state: GameState,
  turn: Turn,
  question: Question,
  slotsChanged: boolean,
): GameState {
  const updated = withQuestion(turn, question);
  const target = targetAnswer(turn.country, question.kind);
  const slotsAreFull =
    question.showsSlots && isComplete(slotCells(target, question.revealedLetters, question.typed));
  return slotsChanged && slotsAreFull ? checkAnswer(state, updated) : { ...state, turn: updated };
}

function reduceTurn(state: GameState, turn: Turn, action: GameAction): GameState {
  if (isTurnOver(turn)) {
    if (action.type !== "next") return state;
    const nextCode = state.roundCodes[state.results.length];
    if (!nextCode) return { ...state, screen: "summary", turn: null };
    return { ...state, turn: newTurn(nextCode, state.settings.mode) };
  }

  const question = currentQuestion(turn);
  const target = targetAnswer(turn.country, question.kind);
  switch (action.type) {
    case "typeText": {
      const typed = question.showsSlots
        ? fitToSlots(action.text, target, question.revealedLetters)
        : action.text.slice(0, MAX_ANSWER_LENGTH);
      return updateQuestion(
        state,
        turn,
        { ...question, typed, mistake: null },
        typed !== question.typed,
      );
    }
    case "submit":
      return checkAnswer(state, turn);
    case "hint": {
      const hint = nextHint(question, target);
      if (!hint) return state;
      const hinted: Question = { ...question, hintsUsed: question.hintsUsed + 1, mistake: null };
      if (hint === "slots") {
        hinted.showsSlots = true;
        hinted.typed = fitToSlots(question.typed, target, 0);
      }
      if (hint === "letter") {
        // The revealed letter takes the slot of the first typed letter.
        hinted.revealedLetters = question.revealedLetters + 1;
        hinted.typed = Array.from(question.typed).slice(1).join("");
      }
      return updateQuestion(state, turn, hinted, true);
    }
    case "giveUp": {
      const revealed = turn.questions.map((q, i) =>
        i >= turn.current ? { ...q, status: "revealed" as const, mistake: null } : q,
      );
      return finishTurn(state, { ...turn, questions: revealed });
    }
    default:
      return state;
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "start":
      return startRound(
        { ...state, settings: action.settings },
        action.deck.slice(0, ROUND_SIZE),
        action.deck.slice(ROUND_SIZE),
      );
    case "nextRound":
      if (state.screen !== "summary") return state;
      return startRound(
        state,
        state.upcoming.slice(0, ROUND_SIZE),
        state.upcoming.slice(ROUND_SIZE),
      );
    case "replay":
      if (state.screen !== "summary") return state;
      return startRound(state, action.deck.slice(0, ROUND_SIZE), state.upcoming);
    case "openMenu":
      return { ...state, screen: "menu", turn: null };
    default:
      return state.turn ? reduceTurn(state, state.turn, action) : state;
  }
}
