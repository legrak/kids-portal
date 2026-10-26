import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { pickVoice, say } from "./speech";

const voice = (name: string, lang: string, isDefault = false) =>
  ({ name, lang, default: isDefault }) as SpeechSynthesisVoice;

describe("pickVoice", () => {
  test("takes the first voice of the language, written with a hyphen or an underscore", () => {
    const voices = [voice("Thomas", "fr-FR"), voice("Lesya", "uk_UA"), voice("Daniel", "en-GB")];

    expect(pickVoice(voices, "uk")?.name).toBe("Lesya");
    expect(pickVoice(voices, "en")?.name).toBe("Daniel");
  });

  test("prefers the system's default voice of the language", () => {
    const voices = [voice("Daniel", "en-GB"), voice("Samantha", "en-US", true)];

    expect(pickVoice(voices, "en")?.name).toBe("Samantha");
  });

  test("skips joke and robot voices", () => {
    const voices = [
      voice("Albert", "en-US"),
      voice("Bad News", "en-US"),
      voice("Eddy (English (US))", "en-US", true),
      voice("Samantha", "en-US"),
    ];

    expect(pickVoice(voices, "en")?.name).toBe("Samantha");
  });

  test("finds nothing for a language without a voice", () => {
    expect(pickVoice([voice("Daniel", "en-GB")], "uk")).toBeUndefined();
  });
});

describe("say", () => {
  class FakeUtterance {
    voice: SpeechSynthesisVoice | null = null;
    lang = "";
    rate = 1;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(readonly text: string) {}
  }

  let spoken: FakeUtterance[] = [];
  let voices: SpeechSynthesisVoice[] = [];

  beforeEach(() => {
    spoken = [];
    voices = [voice("Lesya", "uk-UA"), voice("Daniel", "en-GB")];
    Object.assign(globalThis, {
      SpeechSynthesisUtterance: FakeUtterance,
      speechSynthesis: {
        getVoices: () => voices,
        cancel: () => {},
        speak: (utterance: FakeUtterance) => spoken.push(utterance),
      },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "SpeechSynthesisUtterance");
    Reflect.deleteProperty(globalThis, "speechSynthesis");
  });

  const phrases = [
    { text: "Де синій?", lang: "uk" },
    { text: "Where is blue?", lang: "en" },
  ];

  test("says the phrases in order, each in a voice of its language", () => {
    say(phrases);

    expect(spoken.map((utterance) => [utterance.text, utterance.voice?.name])).toEqual([
      ["Де синій?", "Lesya"],
      ["Where is blue?", "Daniel"],
    ]);
  });

  test("leaves out a phrase in a language without a voice", () => {
    voices = [voice("Daniel", "en-GB")];
    say(phrases);

    expect(spoken.map((utterance) => utterance.text)).toEqual(["Where is blue?"]);
  });

  test("is done once the last phrase is said, or cut off, and only once", () => {
    const onDone = mock();
    say(phrases, onDone);
    spoken[0]?.onend?.();
    expect(onDone).not.toHaveBeenCalled();

    spoken[1]?.onend?.();
    spoken[1]?.onerror?.();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  test("waits longer for long phrases from a voice that never says it has finished", () => {
    const realSetTimeout = globalThis.setTimeout;
    const delays: number[] = [];
    globalThis.setTimeout = ((_: () => void, delay: number) => {
      delays.push(delay);
      return 0;
    }) as unknown as typeof setTimeout;
    try {
      say(phrases, () => {});
      say(
        [{ text: "Так! Це шкільне приладдя, а скрипка — це музичний інструмент.", lang: "uk" }],
        () => {},
      );
    } finally {
      globalThis.setTimeout = realSetTimeout;
    }

    expect(delays[0]).toBe(6000);
    expect(delays[1]).toBeGreaterThan(7000);
  });

  test("is done at once with nothing to say", () => {
    voices = [];
    const onDone = mock();
    say(phrases, onDone);

    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
