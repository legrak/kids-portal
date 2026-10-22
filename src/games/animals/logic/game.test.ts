import { describe, expect, test } from "bun:test";
import { type AnimalKind, CHOICE_COUNT, makeRound, nextRound, pickAnimal, shuffle } from "./game";

const ANIMALS: AnimalKind[] = [
  { id: "cat" },
  { id: "cow" },
  { id: "pig" },
  { id: "horse", lookalikes: "horses" },
  { id: "donkey", lookalikes: "horses" },
  { id: "tiger", lookalikes: "bigCats" },
  { id: "lion", lookalikes: "bigCats" },
];

/** A repeatable random sequence, so a failing case can be replayed. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

describe("shuffle", () => {
  test("keeps every item", () => {
    expect(shuffle([1, 2, 3, 4, 5], seededRandom(1)).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("makeRound", () => {
  test("shows the target and other animals, never two lookalikes", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const random = seededRandom(seed);
      const target = ANIMALS[seed % ANIMALS.length] as AnimalKind;
      const round = makeRound(target, ANIMALS, random);

      expect(round.choices).toHaveLength(CHOICE_COUNT);
      expect(round.choices).toContain(target.id);
      expect(new Set(round.choices).size).toBe(CHOICE_COUNT);
      const groups = round.choices
        .map((id) => ANIMALS.find((animal) => animal.id === id)?.lookalikes)
        .filter(Boolean);
      expect(new Set(groups).size).toBe(groups.length);
    }
  });

  test("puts the target in any place", () => {
    const places = new Set<number>();
    for (let seed = 1; seed <= 50; seed++) {
      const round = makeRound(ANIMALS[0] as AnimalKind, ANIMALS, seededRandom(seed));
      places.add(round.choices.indexOf("cat"));
    }
    expect([...places].sort()).toEqual([0, 1, 2]);
  });

  test("fails when there are not enough unlike animals", () => {
    const lookalikes = ANIMALS.filter((animal) => animal.lookalikes === "horses");
    expect(() => makeRound(lookalikes[0] as AnimalKind, lookalikes)).toThrow();
  });
});

describe("nextRound", () => {
  test("asks about every animal once before asking any again", () => {
    const random = seededRandom(7);
    let game = nextRound(ANIMALS, null, random);
    const asked = [game.round.target];
    for (let i = 1; i < ANIMALS.length * 3; i++) {
      game = nextRound(ANIMALS, game, random);
      asked.push(game.round.target);
    }
    for (let start = 0; start < asked.length; start += ANIMALS.length) {
      const line = asked.slice(start, start + ANIMALS.length);
      expect(new Set(line).size).toBe(ANIMALS.length);
    }
  });

  test("never asks about the same animal twice in a row", () => {
    for (let seed = 1; seed <= 100; seed++) {
      const random = seededRandom(seed);
      let game = nextRound(ANIMALS, null, random);
      for (let i = 0; i < ANIMALS.length * 2; i++) {
        const next = nextRound(ANIMALS, game, random);
        expect(next.round.target).not.toBe(game.round.target);
        game = next;
      }
    }
  });
});

describe("pickAnimal", () => {
  const round = { target: "cow", choices: ["cat", "cow", "pig"], wrongPicks: [], found: false };

  test("finds the target", () => {
    expect(pickAnimal(round, "cow")).toEqual({ ...round, found: true });
  });

  test("remembers wrong picks once each", () => {
    const once = pickAnimal(round, "cat");
    expect(once.wrongPicks).toEqual(["cat"]);
    expect(pickAnimal(once, "cat")).toBe(once);
  });

  test("ignores taps once the target is found, and animals not shown", () => {
    const found = pickAnimal(round, "cow");
    expect(pickAnimal(found, "cat")).toBe(found);
    expect(pickAnimal(round, "tiger")).toBe(round);
  });
});
