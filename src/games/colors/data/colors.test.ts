import { describe, expect, test } from "bun:test";
import { makeRound } from "../../../shared/rounds";
import { CHOICE_COUNT, COLORS, colorById } from "./colors";

describe("colors", () => {
  test("have unique ids, names and shades", () => {
    for (const key of ["id", "uk", "en", "hex"] as const) {
      expect(new Set(COLORS.map((color) => color[key])).size).toBe(COLORS.length);
    }
  });

  test("blue and light blue never share a round", () => {
    for (let round = 0; round < 200; round++) {
      const choices = makeRound(colorById("blue"), COLORS, CHOICE_COUNT).choices;
      expect(choices).toHaveLength(CHOICE_COUNT);
      expect(choices).not.toContain("lightBlue");
    }
  });

  test("every colour can be asked about", () => {
    for (const color of COLORS) {
      expect(makeRound(color, COLORS, CHOICE_COUNT).choices).toHaveLength(CHOICE_COUNT);
    }
  });

  test("colorById finds a colour or fails", () => {
    expect(colorById("blue").uk).toBe("синій");
    expect(() => colorById("violet")).toThrow();
  });
});
