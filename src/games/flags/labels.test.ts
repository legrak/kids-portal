import { describe, expect, test } from "bun:test";
import { pluralUk } from "./labels";

describe("pluralUk", () => {
  test("picks the Ukrainian plural form", () => {
    const flags = (count: number) => pluralUk(count, "прапор", "прапори", "прапорів");

    expect([1, 21, 101].map(flags)).toEqual(["прапор", "прапор", "прапор"]);
    expect([2, 3, 4, 22, 104].map(flags)).toEqual([
      "прапори",
      "прапори",
      "прапори",
      "прапори",
      "прапори",
    ]);
    expect([0, 5, 10, 11, 12, 14, 111, 112].map(flags)).toEqual(Array(8).fill("прапорів"));
  });
});
