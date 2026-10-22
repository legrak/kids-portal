import { describe, expect, test } from "bun:test";
import {
  currentAnswerText,
  type GameAction,
  type GameMode,
  type GameState,
  gameReducer,
  initialGameState,
  nextHint,
  ROUND_SIZE,
  type Turn,
  takenHints,
} from "./game";

const DECK = ["fr", "ir", "nz", "de", "pl", "it", "es", "pt", "jp", "cn", "us", "ca", "br"];

function playDeck(mode: GameMode, deck: string[], ...actions: GameAction[]): GameState {
  const settings = { mode, region: "world", countrySet: "all" } as const;
  return [{ type: "start", settings, deck } as GameAction, ...actions].reduce(
    gameReducer,
    initialGameState(settings),
  );
}

const play = (mode: GameMode, ...actions: GameAction[]) => playDeck(mode, DECK, ...actions);

const giveUpAndGoOn = (flags: number): GameAction[] =>
  Array.from({ length: flags }, (): GameAction[] => [{ type: "giveUp" }, { type: "next" }]).flat();

function turnOf(state: GameState): Turn {
  if (!state.turn) throw new Error("No turn in progress");
  return state.turn;
}

function question(state: GameState) {
  const turn = turnOf(state);
  const current = turn.questions[turn.current];
  if (!current) throw new Error("No current question");
  return current;
}

const answer = (text: string): GameAction[] => [{ type: "typeText", text }, { type: "submit" }];

describe("rounds", () => {
  test("a game starts a round of ten flags from the deck", () => {
    const state = play("country");

    expect(state.screen).toBe("playing");
    expect(state.roundCodes).toEqual(DECK.slice(0, ROUND_SIZE));
    expect(state.upcoming).toEqual(DECK.slice(ROUND_SIZE));
    expect(turnOf(state).country.code).toBe("fr");
  });

  test("a correct answer gives three stars and next moves to the next flag", () => {
    const answered = play("country", ...answer("франція"));

    expect(question(answered).status).toBe("correct");
    expect(answered.results).toEqual([{ code: "fr", stars: 3 }]);

    const next = gameReducer(answered, { type: "next" });
    expect(turnOf(next).country.code).toBe("ir");
  });

  test("the round ends with a summary, and the next round goes on without repeats", () => {
    const finished = play("country", ...giveUpAndGoOn(ROUND_SIZE));

    expect(finished.screen).toBe("summary");
    expect(finished.results).toHaveLength(ROUND_SIZE);

    const nextRound = gameReducer(finished, { type: "nextRound" });
    expect(nextRound.roundCodes).toEqual(["us", "ca", "br"]);
    expect(nextRound.upcoming).toEqual([]);
  });

  test("a shorter last round ends with a summary, and then no round is left", () => {
    const lastRound = gameReducer(play("country", ...giveUpAndGoOn(ROUND_SIZE)), {
      type: "nextRound",
    });
    const finished = [...giveUpAndGoOn(3)].reduce(gameReducer, lastRound);

    expect(finished.screen).toBe("summary");
    expect(finished.results.map((r) => r.code)).toEqual(["us", "ca", "br"]);
    expect(gameReducer(finished, { type: "nextRound" }).screen).toBe("menu");
  });

  test("a new round or a replay can only start from the summary", () => {
    const playing = play("country");

    expect(gameReducer(playing, { type: "nextRound" })).toBe(playing);
    expect(gameReducer(playing, { type: "replay", deck: ["fr"] })).toBe(playing);
  });

  test("replaying a list of flags keeps the flags not shown yet", () => {
    const replay = play("country", ...giveUpAndGoOn(ROUND_SIZE), { type: "replay", deck: ["fr"] });

    expect(replay.roundCodes).toEqual(["fr"]);
    expect(replay.upcoming).toEqual(DECK.slice(ROUND_SIZE));
  });

  test("a game with no countries stays in the menu", () => {
    const settings = { mode: "country", region: "world", countrySet: "all" } as const;
    const state = gameReducer(initialGameState(settings), { type: "start", settings, deck: [] });

    expect(state.screen).toBe("menu");
  });
});

describe("answers", () => {
  test("a wrong answer is kept with a mistake, cleared on the next keystroke", () => {
    const wrong = play("country", ...answer("Італія"));

    expect(question(wrong).mistake).toEqual({ kind: "other", code: "it" });
    expect(question(wrong).typed).toBe("Італія");
    expect(question(gameReducer(wrong, { type: "typeText", text: "Італі" })).mistake).toBeNull();
  });

  test("an answer that names no country is just wrong", () => {
    expect(question(play("country", ...answer("Фрукти"))).mistake).toEqual({ kind: "wrong" });
  });

  test("an empty answer is not checked", () => {
    expect(question(play("country", ...answer("  "))).mistake).toBeNull();
  });

  test("empty slots of a hyphenated name are not checked", () => {
    const state = playDeck(
      "country",
      ["sm"],
      { type: "hint" },
      { type: "hint" },
      { type: "submit" },
    );

    expect(currentAnswerText(turnOf(state))).toBe("-");
    expect(question(state).mistake).toBeNull();
  });

  test("once the turn is over, only next does anything", () => {
    const answered = play("country", ...answer("Франція"));

    for (const action of [{ type: "submit" }, { type: "hint" }, { type: "giveUp" }] as const) {
      expect(gameReducer(answered, action)).toBe(answered);
    }
    expect(answered.results).toEqual([{ code: "fr", stars: 3 }]);
  });

  test("next does nothing while the question is asked", () => {
    const asking = play("country");

    expect(gameReducer(asking, { type: "next" })).toBe(asking);
  });

  test("a typo is accepted and flagged so the right spelling can be shown", () => {
    const state = play("country", ...answer("Франция"));

    expect(question(state).status).toBe("correct");
    expect(question(state).acceptedWithTypo).toBe(true);
  });

  test("the English level wants the English name", () => {
    expect(question(play("english", ...answer("Франція"))).mistake).toEqual({ kind: "wrong" });
    expect(question(play("english", ...answer("France"))).status).toBe("correct");
  });
});

describe("hints", () => {
  test("the country hints go map, letter slots, then one letter at a time", () => {
    const state = play("country", { type: "hint" }, { type: "hint" }, { type: "hint" });

    expect(takenHints(question(state))).toEqual(["map", "slots", "letter"]);
    expect(question(state).revealedLetters).toBe(1);
    expect(nextHint(question(state), "Франція")).toBe("letter");
  });

  test("the English level adds the Ukrainian name after the map", () => {
    const state = play("english", { type: "hint" });

    expect(nextHint(question(state), "France")).toBe("ukrainianName");
  });

  test("turning on the slots keeps the typed letters that fit", () => {
    const state = play(
      "country",
      { type: "typeText", text: "фра нц" },
      { type: "hint" },
      { type: "hint" },
    );

    expect(question(state).showsSlots).toBe(true);
    expect(question(state).typed).toBe("франц");
  });

  test("a hint that fills the last slots checks the answer", () => {
    const typedFirst = play(
      "country",
      { type: "typeText", text: "франція" },
      { type: "hint" },
      { type: "hint" },
    );

    expect(question(typedFirst).status).toBe("correct");
    expect(typedFirst.results).toEqual([{ code: "fr", stars: 2 }]);

    const fixedByLetter = playDeck(
      "countryAndCapital",
      ["it"],
      ...answer("Італія"),
      { type: "hint" },
      { type: "typeText", text: "тим" },
      { type: "hint" },
    );
    expect(currentAnswerText(turnOf(fixedByLetter))).toBe("Рим");
    expect(question(fixedByLetter).status).toBe("correct");
  });

  test("typing past full slots does not check the answer again", () => {
    const full = play(
      "country",
      { type: "hint" },
      { type: "hint" },
      { type: "typeText", text: "абвгдеж" },
    );
    const typedMore = gameReducer(full, { type: "typeText", text: "абвгдежз" });

    expect(question(full).mistake).toEqual({ kind: "wrong" });
    expect(question(typedMore).typed).toBe("абвгдеж");
    expect(question(typedMore).status).toBe("asking");
    expect(question(typedMore).mistake).toBeNull();
  });

  test("a revealed letter takes the place of the first typed letter", () => {
    const state = play(
      "country",
      { type: "hint" },
      { type: "hint" },
      { type: "typeText", text: "фр" },
      { type: "hint" },
    );

    expect(question(state).typed).toBe("р");
    expect(currentAnswerText(turnOf(state))).toBe("Фр");
  });

  test("the last letter is always left to type", () => {
    const hints: GameAction[] = Array.from({ length: 10 }, () => ({ type: "hint" }));
    const state = play("country", ...hints);

    expect(question(state).revealedLetters).toBe("Франція".length - 1);
    expect(nextHint(question(state), "Франція")).toBeNull();
  });

  test("filling every slot checks the answer at once", () => {
    const state = play(
      "country",
      { type: "hint" },
      { type: "hint" },
      { type: "typeText", text: "франція" },
    );

    expect(question(state).status).toBe("correct");
    expect(state.results).toEqual([{ code: "fr", stars: 2 }]);
  });

  test("many hints still earn one star", () => {
    const hints: GameAction[] = Array.from({ length: 3 }, () => ({ type: "hint" }));
    const state = play("country", ...hints, { type: "typeText", text: "ранція" });

    expect(state.results).toEqual([{ code: "fr", stars: 1 }]);
  });
});

describe("country and capital", () => {
  test("after the country comes the capital, and both make the turn", () => {
    const afterCountry = play("countryAndCapital", ...answer("Франція"));

    expect(turnOf(afterCountry).current).toBe(1);
    expect(question(afterCountry).kind).toBe("capital");
    expect(afterCountry.results).toEqual([]);

    const afterCapital = [...answer("париж")].reduce(gameReducer, afterCountry);
    expect(afterCapital.results).toEqual([{ code: "fr", stars: 3 }]);
  });

  test("capital hints start with the letter slots", () => {
    const state = play("countryAndCapital", ...answer("Франція"), { type: "hint" });

    expect(takenHints(question(state))).toEqual(["slots"]);
    expect(question(state).showsSlots).toBe(true);
  });

  test("giving up on the capital keeps one star for the country", () => {
    const state = play("countryAndCapital", ...answer("Франція"), { type: "giveUp" });

    expect(question(state).status).toBe("revealed");
    expect(state.results).toEqual([{ code: "fr", stars: 1 }]);
  });

  test("giving up on the country reveals both and earns no stars", () => {
    const state = play("countryAndCapital", { type: "giveUp" });

    expect(turnOf(state).questions.map((q) => q.status)).toEqual(["revealed", "revealed"]);
    expect(state.results).toEqual([{ code: "fr", stars: 0 }]);
  });
});
