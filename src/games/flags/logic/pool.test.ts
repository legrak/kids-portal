import { describe, expect, test } from "bun:test";
import { COUNTRIES } from "../data/countries";
import { countryPool, shuffle } from "./pool";

function codes(settings: Parameters<typeof countryPool>[1]): string[] {
  return countryPool(COUNTRIES, settings).map((c) => c.code);
}

describe("countryPool", () => {
  test("the whole world has every country that is not excluded", () => {
    const pool = codes({ region: "world", countrySet: "all" });

    expect(pool).toHaveLength(139);
    expect(pool).toContain("ua");
    expect(pool).not.toContain("mh");
  });

  test("the well-known set keeps only famous countries", () => {
    const pool = codes({ region: "world", countrySet: "famous" });

    expect(pool).toHaveLength(45);
    expect(pool).toContain("jp");
    expect(pool).not.toContain("by");
  });

  test("a region keeps only its countries; the Americas join North and South", () => {
    const europe = countryPool(COUNTRIES, { region: "europe", countrySet: "all" });
    const americas = codes({ region: "americas", countrySet: "all" });

    expect(europe.every((c) => c.region === "europe")).toBe(true);
    expect(europe).toHaveLength(45);
    expect(americas).toHaveLength(18);
    expect(americas).toContain("ca");
    expect(americas).toContain("br");
    expect(americas).not.toContain("ua");
  });

  test("region and set combine", () => {
    expect(codes({ region: "africa", countrySet: "famous" })).toEqual(["eg", "za"]);
  });
});

describe("shuffle", () => {
  test("keeps every item exactly once and leaves the input untouched", () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = shuffle(items, () => 0);

    expect(shuffled).toEqual([2, 3, 4, 5, 1]);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  test("uses the random source", () => {
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1]);
    expect(shuffle([1, 2, 3, 4], () => 0.999)).toEqual([1, 2, 3, 4]);
  });
});
