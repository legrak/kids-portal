import { describe, expect, test } from "bun:test";
import { categoryById, thingById } from "./data/things";
import { explanationFor, questionFor, wrongPickFor } from "./speech";

const texts = (phrases: { text: string }[]) => phrases.map((phrase) => phrase.text);

describe("phrases", () => {
  test("ask which one doesn't belong, in the language picked", () => {
    expect(texts(questionFor("both"))).toEqual(["Що тут зайве?", "Which one doesn't belong?"]);
    expect(questionFor("uk")).toEqual([{ text: "Що тут зайве?", lang: "uk" }]);
  });

  test("say what the three are and what the odd one is", () => {
    expect(texts(explanationFor(categoryById("fruit"), thingById("car"), "both"))).toEqual([
      "Так! Це фрукти, а\u00a0машина\u00a0— це транспорт.",
      "Yes! These are fruits, and the car is a vehicle.",
    ]);
    expect(texts(explanationFor(categoryById("toys"), thingById("skis"), "both"))).toEqual([
      "Так! Це іграшки, а\u00a0лижі\u00a0— для спорту.",
      "Yes! These are toys, and the skis are for sport.",
    ]);
  });

  test("name a wrong pick, then ask again", () => {
    expect(texts(wrongPickFor(thingById("apple"), "both"))).toEqual([
      "Яблуко\u00a0— це фрукт. Що тут зайве?",
      "The apple is a fruit. Which one doesn't belong?",
    ]);
    expect(texts(wrongPickFor(thingById("grapes"), "en"))).toEqual([
      "The grapes are berries. Which one doesn't belong?",
    ]);
  });
});
