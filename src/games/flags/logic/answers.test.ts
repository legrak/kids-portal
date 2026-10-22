import { describe, expect, test } from "bun:test";
import {
  allowedTypos,
  editDistance,
  matchAnswer,
  type NamedOption,
  normalizeAnswer,
} from "./answers";

describe("normalizeAnswer", () => {
  test("ignores case, spaces, hyphens, apostrophes and dots", () => {
    expect(normalizeAnswer(" Кот-д’Івуар ")).toBe("котдівуар");
    expect(normalizeAnswer("кот д'івуар")).toBe("котдівуар");
    expect(normalizeAnswer("в‘єтнам")).toBe("вєтнам");
    expect(normalizeAnswer("Washington, D.C.")).toBe("washingtondc");
  });

  test("drops accents on Latin letters but keeps й and ї", () => {
    expect(normalizeAnswer("Côte d’Ivoire")).toBe("cotedivoire");
    expect(normalizeAnswer("Türkiye")).toBe("turkiye");
    expect(normalizeAnswer("Китай")).toBe("китай");
    expect(normalizeAnswer("Ізраїль")).toBe("ізраїль");
  });

  test("reads ґ as г", () => {
    expect(normalizeAnswer("Ґана")).toBe("гана");
  });
});

describe("editDistance", () => {
  test("counts insertions, deletions and substitutions", () => {
    expect(editDistance("", "")).toBe(0);
    expect(editDistance("іран", "іран")).toBe(0);
    expect(editDistance("іран", "ірак")).toBe(1);
    expect(editDistance("нігер", "нігерія")).toBe(2);
    expect(editDistance("", "abc")).toBe(3);
    expect(editDistance("kitten", "sitting")).toBe(3);
  });

  test("counts two swapped neighbouring letters as one typo", () => {
    expect(editDistance("фарнція", "франція")).toBe(1);
    expect(editDistance("ab", "ba")).toBe(1);
    expect(editDistance("abc", "ca")).toBe(3);
  });
});

describe("allowedTypos", () => {
  test("allows none for short names, one for medium and two for long ones", () => {
    expect(allowedTypos(4)).toBe(0);
    expect(allowedTypos(5)).toBe(1);
    expect(allowedTypos(8)).toBe(1);
    expect(allowedTypos(9)).toBe(2);
  });
});

describe("matchAnswer", () => {
  const others: NamedOption[] = [
    { code: "iq", names: ["Ірак"] },
    { code: "ne", names: ["Нігер"] },
    { code: "at", names: ["Австрія"] },
  ];

  test("accepts the name and its aliases in any case and spacing", () => {
    expect(matchAnswer("сша", ["США", "Америка"], others)).toEqual({ kind: "exact" });
    expect(matchAnswer("АМЕРИКА", ["США", "Америка"], others)).toEqual({ kind: "exact" });
    expect(matchAnswer("Гвінея Бісау", ["Гвінея-Бісау"], others)).toEqual({ kind: "exact" });
  });

  test("accepts a small typo in a long enough name", () => {
    expect(matchAnswer("Нігерия", ["Нігерія"], others)).toEqual({ kind: "typo" });
    expect(matchAnswer("Австралия", ["Австралія"], others)).toEqual({ kind: "typo" });
    expect(matchAnswer("Фарнція", ["Франція"], others)).toEqual({ kind: "typo" });
  });

  test("accepts two typos in a long name", () => {
    expect(matchAnswer("Австралиа", ["Австралія"], others)).toEqual({ kind: "typo" });
  });

  test("accepts a typo in an alias", () => {
    expect(matchAnswer("Амерыка", ["США", "Америка"], others)).toEqual({ kind: "typo" });
  });

  test("rejects too many typos, and any typo in a short name", () => {
    expect(matchAnswer("Нігарея", ["Нігерія"], others)).toEqual({ kind: "wrong" });
    expect(matchAnswer("Ірат", ["Іран"], others)).toEqual({ kind: "wrong" });
  });

  test("says which other country an answer names", () => {
    expect(matchAnswer("Ірак", ["Іран"], others)).toEqual({ kind: "other", code: "iq" });
    expect(matchAnswer("австрія", ["Австралія"], others)).toEqual({ kind: "other", code: "at" });
    expect(
      matchAnswer("Голландія", ["Бельгія"], [{ code: "nl", names: ["Нідерланди", "Голландія"] }]),
    ).toEqual({ kind: "other", code: "nl" });
  });

  test("accepts a typo only when it is closer to an accepted name than to another country's", () => {
    expect(matchAnswer("Нігері", ["Нігерія"], others)).toEqual({ kind: "wrong" });
    expect(matchAnswer("Австрілія", ["Австралія"], others)).toEqual({ kind: "typo" });
  });

  test("rejects an empty answer", () => {
    expect(matchAnswer(" - ", ["Іран"], others)).toEqual({ kind: "wrong" });
  });
});
