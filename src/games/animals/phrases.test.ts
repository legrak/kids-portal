import { describe, expect, test } from "bun:test";
import { animalById } from "./data/animals";
import { foundFor, questionFor } from "./phrases";

const texts = (phrases: { text: string }[]) => phrases.map((phrase) => phrase.text);

describe("phrases", () => {
  test("ask for the animal in the language picked", () => {
    expect(texts(questionFor(animalById("cow"), "both"))).toEqual([
      "Де корова?",
      "Where is the cow?",
    ]);
    expect(texts(questionFor(animalById("cow"), "en"))).toEqual(["Where is the cow?"]);
  });

  test("name the animal found, with the right English article", () => {
    expect(texts(foundFor(animalById("cow"), "both"))).toEqual(["Це корова!", "It's a cow!"]);
    expect(texts(foundFor(animalById("owl"), "en"))).toEqual(["It's an owl!"]);
    expect(texts(foundFor(animalById("elephant"), "en"))).toEqual(["It's an elephant!"]);
  });
});
