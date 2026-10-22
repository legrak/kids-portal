import { describe, expect, test } from "bun:test";
import { normalizeAnswer } from "../logic/answers";
import { COUNTRIES, type Country, type LocalizedNames } from "./countries";

const LANGUAGES = ["uk", "en"] as const;

function namesOf(names: LocalizedNames): string[] {
  return [names.name, ...(names.aliases ?? [])];
}

function capitalsOf(names: LocalizedNames): string[] {
  return [names.capital, ...(names.capitalAliases ?? [])];
}

function byCode(code: string): Country {
  const country = COUNTRIES.find((c) => c.code === code);
  if (!country) throw new Error(`No country ${code}`);
  return country;
}

describe("COUNTRIES", () => {
  test("has 194 countries: the UN member states and the Vatican", () => {
    expect(COUNTRIES).toHaveLength(194);
  });

  test("codes are unique lowercase ISO alpha-2 and numeric codes", () => {
    const codes = COUNTRIES.map((c) => c.code);
    const numericCodes = COUNTRIES.map((c) => c.isoNumeric);

    expect(codes.every((code) => /^[a-z]{2}$/.test(code))).toBe(true);
    expect(numericCodes.every((code) => /^\d{3}$/.test(code))).toBe(true);
    expect(new Set(codes).size).toBe(COUNTRIES.length);
    expect(new Set(numericCodes).size).toBe(COUNTRIES.length);
  });

  test("names and capitals are filled in and trimmed in both languages", () => {
    const badTexts = COUNTRIES.flatMap((country) =>
      LANGUAGES.flatMap((language) => [
        ...namesOf(country[language]),
        ...capitalsOf(country[language]),
      ]),
    ).filter((text) => text.length === 0 || text !== text.trim());

    expect(badTexts).toEqual([]);
  });

  test("Ukrainian names use the Ukrainian apostrophe", () => {
    const withStraightApostrophe = COUNTRIES.flatMap((c) => [
      ...namesOf(c.uk),
      ...capitalsOf(c.uk),
    ]).filter((text) => /['ʼ`]/.test(text));

    expect(withStraightApostrophe).toEqual([]);
  });

  test("no two countries share a name, a capital or an alias as the game compares them", () => {
    const clashes: string[] = [];
    for (const language of LANGUAGES) {
      for (const textsOf of [namesOf, capitalsOf]) {
        const owners = new Map<string, string>();
        for (const country of COUNTRIES) {
          for (const text of textsOf(country[language])) {
            const key = normalizeAnswer(text);
            const owner = owners.get(key);
            if (owner && owner !== country.code) clashes.push(`${text}: ${owner}, ${country.code}`);
            owners.set(key, country.code);
          }
        }
      }
    }
    expect(clashes).toEqual([]);
  });

  test("tiny island states and little-known countries are excluded", () => {
    for (const code of ["mh", "kn", "gq", "pg"]) {
      expect(byCode(code).tier).toBe("excluded");
    }
    expect(COUNTRIES.filter((c) => c.tier !== "excluded")).toHaveLength(127);
  });

  test("the well-known set has Ukraine and its western neighbours", () => {
    for (const code of ["ua", "pl", "sk", "hu", "ro", "md"]) {
      expect(byCode(code).tier).toBe("famous");
    }
  });
});
