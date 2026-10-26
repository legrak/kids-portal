import { describe, expect, test } from "bun:test";
import { COUNTRIES } from "../data/countries";
import { CHOICE_COUNT, dealChoices } from "./choices";
import { countryPool } from "./pool";

const codesOf = (settings: Parameters<typeof countryPool>[1]) =>
  countryPool(COUNTRIES, settings).map((country) => country.code);

describe("dealChoices", () => {
  test("every country gets four different names, itself among them, in a random place", () => {
    const settings = { region: "world", countrySet: "all" } as const;
    const codes = codesOf(settings);
    const choices = dealChoices(COUNTRIES, codes, settings);

    for (const code of codes) {
      const options = choices[code] ?? [];
      expect(options).toHaveLength(CHOICE_COUNT);
      expect(new Set(options).size).toBe(CHOICE_COUNT);
      expect(options).toContain(code);
    }
    const places = new Set(codes.map((code) => choices[code]?.indexOf(code)));
    expect(places.size).toBe(CHOICE_COUNT);
  });

  test("the other names come from the countries of the game", () => {
    const settings = { region: "europe", countrySet: "famous" } as const;
    const codes = codesOf(settings);
    const choices = dealChoices(COUNTRIES, codes, settings);

    for (const code of codes) {
      for (const option of choices[code] ?? []) expect(codes).toContain(option);
    }
  });

  test("a game of fewer than four countries takes more from its part of the world", () => {
    const settings = { region: "africa", countrySet: "famous" } as const;
    const africa = codesOf({ region: "africa", countrySet: "all" });
    const choices = dealChoices(COUNTRIES, ["eg", "za"], settings);

    expect(choices.eg).toHaveLength(CHOICE_COUNT);
    expect(choices.eg).toContain("za");
    for (const option of choices.eg ?? []) expect(africa).toContain(option);
  });

  test("a flag is never offered with the name of a country whose flag looks the same", () => {
    const lookalikes = [
      ["id", "mc"],
      ["td", "ro"],
      ["nl", "lu"],
    ];
    const codes = lookalikes.flat();
    // With these six countries only, each one's lookalike would come up in most deals.
    const countries = COUNTRIES.filter((country) => codes.includes(country.code));

    for (let deal = 0; deal < 50; deal++) {
      const choices = dealChoices(countries, codes, { region: "world", countrySet: "all" });
      for (const [first, second] of lookalikes) {
        expect(choices[first as string]).not.toContain(second);
        expect(choices[second as string]).not.toContain(first);
      }
    }
  });
});
