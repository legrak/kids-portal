import { describe, expect, test } from "bun:test";
import { CHOICE_COUNT, makeRound } from "../logic/game";
import { ANIMALS, animalById } from "./animals";

const COMMONS_FILE = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//;
// Wikimedia serves thumbnails in standard widths only.
const STANDARD_THUMB = /\/thumb\/.+\/(250|330|500|960)px-[^/]+$/;

describe("animals", () => {
  test("have unique ids and names", () => {
    expect(new Set(ANIMALS.map((animal) => animal.id)).size).toBe(ANIMALS.length);
    expect(new Set(ANIMALS.map((animal) => animal.name)).size).toBe(ANIMALS.length);
    expect(ANIMALS.length).toBeGreaterThanOrEqual(25);
  });

  test.each(ANIMALS.map((animal) => [animal.id, animal]))(
    "%s links a Commons photo and an MP3, with credits",
    (_, animal) => {
      expect(animal.photo.url).toMatch(COMMONS_FILE);
      expect(animal.photo.url).toMatch(STANDARD_THUMB);
      expect(animal.sound.url).toMatch(COMMONS_FILE);
      expect(animal.sound.url).toMatch(/\.mp3$/);
      for (const credit of [animal.photo, animal.sound]) {
        expect(credit.author).not.toBe("");
        expect(credit.license).not.toBe("");
        expect(credit.source).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      }
      const { start = 0, end } = animal.sound;
      if (end !== undefined) expect(end).toBeGreaterThan(start);
    },
  );

  test("each lookalike group has more than one animal", () => {
    const sizes = new Map<string, number>();
    for (const { lookalikes } of ANIMALS) {
      if (lookalikes) sizes.set(lookalikes, (sizes.get(lookalikes) ?? 0) + 1);
    }
    for (const size of sizes.values()) expect(size).toBeGreaterThan(1);
  });

  test("every animal can be asked about", () => {
    for (const animal of ANIMALS) {
      expect(makeRound(animal, ANIMALS).choices).toHaveLength(CHOICE_COUNT);
    }
  });

  test("animalById finds an animal or fails", () => {
    expect(animalById("cow").name).toBe("корова");
    expect(() => animalById("unicorn")).toThrow();
  });
});
