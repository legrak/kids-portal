import { describe, expect, test } from "bun:test";
import { colorById } from "./data/colors";
import { questionFor, wrongPickFor } from "./speech";

describe("phrases", () => {
  test("ask for the colour, and name a wrong one, in the language picked", () => {
    const blue = colorById("blue");
    expect(questionFor(blue, "uk")).toEqual([{ text: "Де синій?", lang: "uk" }]);
    expect(wrongPickFor(colorById("red"), blue, "both").map((phrase) => phrase.text)).toEqual([
      "Це червоний. Де синій?",
      "That's red. Where is blue?",
    ]);
  });
});
