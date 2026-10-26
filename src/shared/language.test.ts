import { describe, expect, test } from "bun:test";
import { langsOf, missingVoiceNotice, phrasesIn } from "./language";

describe("languages", () => {
  test("both languages come Ukrainian first", () => {
    expect(langsOf("both")).toEqual(["uk", "en"]);
    expect(langsOf("en")).toEqual(["en"]);
  });

  test("the phrases follow the language", () => {
    const words = { uk: "Де синій?", en: "Where is blue?" };
    expect(phrasesIn("both", words).map((phrase) => phrase.text)).toEqual([
      "Де синій?",
      "Where is blue?",
    ]);
    expect(phrasesIn("en", words)).toEqual([{ text: "Where is blue?", lang: "en" }]);
  });
});

describe("missingVoiceNotice", () => {
  test("is silent when every voice the game needs is there", () => {
    expect(missingVoiceNotice("both", [])).toBeNull();
    expect(missingVoiceNotice("en", ["uk"])).toBeNull();
  });

  test("says which language is left, or that the question is only written", () => {
    expect(missingVoiceNotice("both", ["uk"])).toStartWith(
      "На цьому пристрої немає українського голосу, тож гра питатиме лише англійською.",
    );
    expect(missingVoiceNotice("uk", ["uk"])).toStartWith(
      "На цьому пристрої немає українського голосу, тож питання буде лише написане.",
    );
    expect(missingVoiceNotice("both", ["en"])).toStartWith(
      "На цьому пристрої немає англійського голосу, тож гра питатиме лише українською.",
    );
    expect(missingVoiceNotice("both", ["uk", "en"])).toStartWith(
      "На цьому пристрої немає ні українського, ні англійського голосу, тож питання буде лише написане.",
    );
  });

  test("points to the device settings, for one voice or both", () => {
    expect(missingVoiceNotice("uk", ["uk"])).toEndWith(
      "На деяких пристроях голос можна додати в налаштуваннях.",
    );
    expect(missingVoiceNotice("both", ["uk", "en"])).toEndWith(
      "На деяких пристроях голоси можна додати в налаштуваннях.",
    );
  });
});
