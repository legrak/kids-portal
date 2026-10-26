import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { GROUP_SIZE, makeRound, pairing } from "../rounds";
import { CATEGORIES, categoryById, THINGS, type Thing, thingById } from "./things";

const PICTURES_DIR = new URL("../../../../public/fluent-emoji/", import.meta.url);

describe("things", () => {
  test("have unique ids and names", () => {
    for (const key of ["id", "uk", "en"] as const) {
      expect(new Set(THINGS.map((thing) => thing[key])).size).toBe(THINGS.length);
    }
    expect(new Set(CATEGORIES.map((category) => category.id)).size).toBe(CATEGORIES.length);
  });

  test("belong to categories that exist, and are also counted only in other ones", () => {
    for (const thing of THINGS) {
      expect(categoryById(thing.category).id).toBe(thing.category);
      for (const other of thing.alsoIn ?? []) {
        expect(categoryById(other).id).not.toBe(thing.category);
      }
    }
  });

  test("each has its picture, and each picture is of a thing", () => {
    const pictures = readdirSync(PICTURES_DIR).filter((name) => name.endsWith(".webp"));
    expect(pictures.sort()).toEqual(THINGS.map((thing) => `${thing.id}.webp`).sort());
  });

  test("a category with an article in English has a plural for plural names", () => {
    for (const category of CATEGORIES) {
      if (/^an? /.test(category.isA.en)) expect(category.enPlural).toBeDefined();
    }
  });
});

describe("categories", () => {
  test("have enough things for rounds that differ", () => {
    for (const category of CATEGORIES) {
      const things = THINGS.filter((thing) => thing.category === category.id);
      expect(things.length).toBeGreaterThan(GROUP_SIZE);
    }
  });

  test("each can be the three next to an odd one of every other, but berries and fruit", () => {
    const apart: string[] = [];
    for (const group of CATEGORIES) {
      expect(makeRound(group.id, THINGS).choices).toHaveLength(GROUP_SIZE + 1);
      for (const other of CATEGORIES) {
        const { members, odds } = pairing(THINGS, group.id, other.id);
        if (other !== group && (members.length < GROUP_SIZE || odds.length === 0)) {
          apart.push(`${group.id}+${other.id}`);
        }
      }
    }
    expect(apart).toEqual(["fruit+berries", "berries+fruit"]);
  });

  test("make rounds with only one odd one", () => {
    const fits = (thing: Thing, category: string) =>
      thing.category === category || (thing.alsoIn?.includes(category) ?? false);
    for (const group of CATEGORIES) {
      for (let i = 0; i < 300; i++) {
        const round = makeRound(group.id, THINGS);
        const shown = round.choices.map(thingById);
        const odd = shown.filter((thing) => {
          const others = shown.filter((other) => other !== thing);
          return CATEGORIES.some((category) => others.every((other) => fits(other, category.id)));
        });
        expect(odd.map((thing) => thing.id)).toEqual([round.target]);
      }
    }
  });

  test("categoryById and thingById find one or fail", () => {
    expect(categoryById("fruit").these.uk).toBe("Це фрукти");
    expect(thingById("apple").uk).toBe("яблуко");
    expect(() => categoryById("planets")).toThrow();
    expect(() => thingById("unicorn")).toThrow();
  });
});
