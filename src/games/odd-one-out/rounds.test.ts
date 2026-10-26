import { describe, expect, test } from "bun:test";
import { type CategorizedItem, GROUP_SIZE, makeRound, nextRound } from "./rounds";

const THINGS: CategorizedItem[] = [
  { id: "apple", category: "fruit" },
  { id: "pear", category: "fruit" },
  { id: "banana", category: "fruit" },
  { id: "plum", category: "fruit" },
  { id: "strawberry", category: "berries", alsoIn: ["fruit"] },
  { id: "cherry", category: "berries", alsoIn: ["fruit"] },
  { id: "grapes", category: "berries", alsoIn: ["fruit"] },
  { id: "car", category: "vehicles" },
  { id: "bus", category: "vehicles" },
  { id: "plane", category: "vehicles" },
  { id: "bicycle", category: "vehicles", alsoIn: ["sport"] },
  { id: "ball", category: "sport", alsoIn: ["toys"] },
  { id: "teddy", category: "toys", lookalikes: "bears" },
  { id: "kite", category: "toys" },
  { id: "dice", category: "toys" },
  { id: "yoYo", category: "toys" },
  { id: "guitar", category: "music" },
  { id: "piano", category: "music" },
  { id: "drum", category: "music", alsoIn: ["toys"] },
  { id: "maracas", category: "music", alsoIn: ["toys"] },
  { id: "bear", category: "forest", lookalikes: "bears" },
  { id: "fox", category: "forest" },
  { id: "wolf", category: "forest" },
  { id: "deer", category: "forest" },
  { id: "skis", category: "sport" },
  { id: "skates", category: "sport" },
];

const CATEGORY_COUNT = 7;

const fits = (thing: CategorizedItem, category: string) =>
  thing.category === category || (thing.alsoIn?.includes(category) ?? false);

/** The things of a round that are odd: the other three share a category. */
function oddOnes(shown: CategorizedItem[]): string[] {
  const categories = [...new Set(THINGS.map((thing) => thing.category))];
  return shown
    .filter((thing) => {
      const others = shown.filter((other) => other !== thing);
      return categories.some((category) => others.every((other) => fits(other, category)));
    })
    .map((thing) => thing.id);
}

const byId = (id: string) => THINGS.find((thing) => thing.id === id) as CategorizedItem;

/** A repeatable random sequence, so a failing case can be replayed. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

describe("makeRound", () => {
  test("shows three things of the category and one of another, the odd one", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const round = makeRound("fruit", THINGS, seededRandom(seed));

      expect(round.choices).toHaveLength(GROUP_SIZE + 1);
      expect(new Set(round.choices).size).toBe(GROUP_SIZE + 1);
      expect(round.choices).toContain(round.target);
      const members = round.choices.filter((id) => id !== round.target).map(byId);
      expect(members.every((thing) => thing.category === "fruit")).toBe(true);
      expect(byId(round.target).category).not.toBe("fruit");
    }
  });

  test("never makes a thing the odd one next to a category it could also be counted in", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const round = makeRound("fruit", THINGS, seededRandom(seed));
      expect(byId(round.target).category).not.toBe("berries");
    }
  });

  test("never shows one of the three next to an odd one of a category it also fits", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const round = makeRound("vehicles", THINGS, seededRandom(seed));
      if (byId(round.target).category === "sport") expect(round.choices).not.toContain("bicycle");
    }
  });

  test("has only one odd one, even where things fit more than one category", () => {
    for (const group of ["music", "sport", "toys", "berries"]) {
      for (let seed = 1; seed <= 300; seed++) {
        const round = makeRound(group, THINGS, seededRandom(seed));
        expect(oddOnes(round.choices.map(byId))).toEqual([round.target]);
      }
    }
  });

  test("never shows two lookalikes, either as the odd one or among the three", () => {
    const odds = new Set<string>();
    for (const group of ["toys", "forest"]) {
      for (let seed = 1; seed <= 300; seed++) {
        const round = makeRound(group, THINGS, seededRandom(seed));
        expect(round.choices.includes("bear") && round.choices.includes("teddy")).toBe(false);
        odds.add(round.target);
      }
    }
    expect(odds).toContain("bear");
    expect(odds).toContain("teddy");
  });

  test("puts the odd one in any place, from any other category", () => {
    const places = new Set<number>();
    const odds = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) {
      const round = makeRound("vehicles", THINGS, seededRandom(seed));
      places.add(round.choices.indexOf(round.target));
      odds.add(byId(round.target).category);
    }
    expect([...places].sort()).toEqual([0, 1, 2, 3]);
    expect([...odds].sort()).toEqual(["berries", "forest", "fruit", "music", "sport", "toys"]);
  });

  test("fails when no category can give the odd one", () => {
    expect(() => makeRound("berries", THINGS.slice(0, 7))).toThrow();
  });
});

describe("nextRound", () => {
  test("gives every category its turn before any has another", () => {
    const random = seededRandom(7);
    let game = nextRound(THINGS, null, random);
    const groups = [game.round.group];
    for (let i = 1; i < CATEGORY_COUNT * 3; i++) {
      game = nextRound(THINGS, game, random);
      groups.push(game.round.group);
    }
    for (let start = 0; start < groups.length; start += CATEGORY_COUNT) {
      expect(new Set(groups.slice(start, start + CATEGORY_COUNT)).size).toBe(CATEGORY_COUNT);
    }
  });

  test("never plays the same category twice in a row", () => {
    for (let seed = 1; seed <= 100; seed++) {
      const random = seededRandom(seed);
      let game = nextRound(THINGS, null, random);
      for (let i = 0; i < CATEGORY_COUNT * 2; i++) {
        const next = nextRound(THINGS, game, random);
        expect(next.round.group).not.toBe(game.round.group);
        game = next;
      }
    }
  });
});
