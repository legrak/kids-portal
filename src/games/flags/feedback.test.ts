import { describe, expect, test } from "bun:test";
import { feedbackFor } from "./feedback";
import { type GameAction, type GameState, gameReducer, initialGameState } from "./logic/game";

const SETTINGS = { mode: "countryAndCapital", region: "world", countrySet: "all" } as const;

function started(deck: string[]): GameState {
  return gameReducer(initialGameState(SETTINGS), { type: "start", settings: SETTINGS, deck });
}

function feedbackAfter(state: GameState, ...actions: GameAction[]) {
  const after = actions.reduce(gameReducer, state);
  return { after, feedback: feedbackFor(state, after) };
}

describe("feedbackFor", () => {
  const playing = started(["fr", "de"]);

  test("a right answer plays the happy sound with confetti", () => {
    const { feedback } = feedbackAfter(
      playing,
      { type: "typeText", text: "Франція" },
      { type: "submit" },
    );

    expect(feedback).toEqual({ sound: "correct", confetti: "answer" });
  });

  test("a wrong answer plays the soft sound, and so does each new wrong answer", () => {
    const { after, feedback } = feedbackAfter(
      playing,
      { type: "typeText", text: "Італія" },
      { type: "submit" },
    );
    expect(feedback).toEqual({ sound: "wrong", confetti: null });

    expect(feedbackAfter(after, { type: "submit" }).feedback).toEqual({
      sound: "wrong",
      confetti: null,
    });
  });

  test("a hint chimes", () => {
    expect(feedbackAfter(playing, { type: "hint" }).feedback).toEqual({
      sound: "hint",
      confetti: null,
    });
  });

  test("typing, giving up and moving on are quiet", () => {
    expect(feedbackAfter(playing, { type: "typeText", text: "Ф" }).feedback.sound).toBeNull();
    const { after: gaveUp, feedback } = feedbackAfter(playing, { type: "giveUp" });
    expect(feedback.sound).toBeNull();
    expect(feedbackAfter(gaveUp, { type: "next" }).feedback.sound).toBeNull();
  });

  test("the end of a round plays a fanfare, with confetti when it went well", () => {
    const solved: GameAction[] = [
      { type: "typeText", text: "Франція" },
      { type: "submit" },
      { type: "typeText", text: "Париж" },
      { type: "submit" },
    ];
    const good = started(["fr"]);
    const goodEnd = feedbackAfter([...solved].reduce(gameReducer, good), { type: "next" });
    expect(goodEnd.feedback).toEqual({ sound: "roundEnd", confetti: "round" });

    const bad = [{ type: "giveUp" } as GameAction].reduce(gameReducer, started(["fr"]));
    expect(feedbackAfter(bad, { type: "next" }).feedback).toEqual({
      sound: "roundEnd",
      confetti: null,
    });
  });
});
