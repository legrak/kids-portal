import type { SoundName } from "../../shared/sound";
import type { GameState, Turn } from "./logic/game";

export interface Feedback {
  sound: SoundName | null;
  confetti: "answer" | "round" | null;
}

const NOTHING: Feedback = { sound: null, confetti: null };

/** A round where the kid got at least half of the stars ends with confetti. */
const ROUND_CONFETTI_SHARE = 0.5;

function correctAnswers(turn: Turn): number {
  return turn.questions.filter((question) => question.status === "correct").length;
}

function currentMistake(turn: Turn) {
  return turn.questions[turn.current]?.mistake ?? null;
}

function hintsTaken(turn: Turn): number {
  return turn.questions.reduce((sum, question) => sum + question.hintsUsed, 0);
}

/** The sound and confetti for a change of the game state, if any. */
export function feedbackFor(before: GameState, after: GameState): Feedback {
  if (after.screen === "summary" && before.screen !== "summary") {
    const stars = after.results.reduce((sum, result) => sum + result.stars, 0);
    const share = stars / Math.max(1, after.results.length * 3);
    return { sound: "roundEnd", confetti: share >= ROUND_CONFETTI_SHARE ? "round" : null };
  }

  const { turn: beforeTurn } = before;
  const { turn: afterTurn } = after;
  if (!beforeTurn || !afterTurn || beforeTurn.country.code !== afterTurn.country.code) {
    return NOTHING;
  }
  if (correctAnswers(afterTurn) > correctAnswers(beforeTurn)) {
    return { sound: "correct", confetti: "answer" };
  }
  const mistake = currentMistake(afterTurn);
  if (mistake && mistake !== currentMistake(beforeTurn)) return { sound: "wrong", confetti: null };
  if (hintsTaken(afterTurn) > hintsTaken(beforeTurn)) return { sound: "hint", confetti: null };
  return NOTHING;
}
