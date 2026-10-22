import { describe, expect, test } from "bun:test";
import { hasLettersOfOtherAlphabet, KEYBOARD_ROWS, remapPhysicalKey } from "./keyboardLayouts";

describe("remapPhysicalKey", () => {
  test("types Ukrainian by key position on an English layout", () => {
    expect(remapPhysicalKey("uk", "q", "KeyQ")).toBe("й");
    expect(remapPhysicalKey("uk", "S", "KeyS")).toBe("і");
    expect(remapPhysicalKey("uk", "]", "BracketRight")).toBe("ї");
    expect(remapPhysicalKey("uk", "`", "Backquote")).toBe("’");
  });

  test("types Ukrainian by key position on a Russian layout", () => {
    expect(remapPhysicalKey("uk", "ы", "KeyS")).toBe("і");
    expect(remapPhysicalKey("uk", "э", "Quote")).toBe("є");
    expect(remapPhysicalKey("uk", "ъ", "BracketRight")).toBe("ї");
  });

  test("leaves Ukrainian letters, spaces, hyphens and control keys alone", () => {
    expect(remapPhysicalKey("uk", "й", "KeyQ")).toBeNull();
    expect(remapPhysicalKey("uk", "Ї", "BracketRight")).toBeNull();
    expect(remapPhysicalKey("uk", " ", "Space")).toBeNull();
    expect(remapPhysicalKey("uk", "-", "Minus")).toBeNull();
    expect(remapPhysicalKey("uk", "Backspace", "Backspace")).toBeNull();
    expect(remapPhysicalKey("uk", "Unidentified", "")).toBeNull();
  });

  test("keeps the apostrophe of the macOS Ukrainian layout", () => {
    expect(remapPhysicalKey("uk", "ʼ", "Backslash")).toBeNull();
  });

  test("maps every letter key of an English layout to its Ukrainian letter", () => {
    const keys = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`\\";
    const codes = [
      ..."QWERTYUIOP".split("").map((l) => `Key${l}`),
      "BracketLeft",
      "BracketRight",
      ..."ASDFGHJKL".split("").map((l) => `Key${l}`),
      "Semicolon",
      "Quote",
      ..."ZXCVBNM".split("").map((l) => `Key${l}`),
      "Comma",
      "Period",
      "Backquote",
      "Backslash",
    ];
    const typed = codes.map((code, i) => remapPhysicalKey("uk", keys[i] as string, code)).join("");

    expect(typed).toBe("йцукенгшщзхїфівапролджєячсмитьбю’ґ");
    expect(remapPhysicalKey("uk", "\\", "IntlBackslash")).toBe("ґ");
  });

  test("types English by key position on a Ukrainian layout", () => {
    expect(remapPhysicalKey("en", "й", "KeyQ")).toBe("q");
    expect(remapPhysicalKey("en", "q", "KeyQ")).toBeNull();
    expect(remapPhysicalKey("en", "ж", "Semicolon")).toBeNull();
    expect(remapPhysicalKey("en", "є", "Quote")).toBe("’");
  });
});

describe("hasLettersOfOtherAlphabet", () => {
  test("spots Latin letters in a Ukrainian answer and Cyrillic in an English one", () => {
    expect(hasLettersOfOtherAlphabet("uk", "Фрfнція")).toBe(true);
    expect(hasLettersOfOtherAlphabet("uk", "Кот-д’Івуар")).toBe(false);
    expect(hasLettersOfOtherAlphabet("uk", "Былорусь")).toBe(true);
    expect(hasLettersOfOtherAlphabet("en", "Frаnce")).toBe(true);
    expect(hasLettersOfOtherAlphabet("en", "Cote d’Ivoire")).toBe(false);
  });
});

describe("KEYBOARD_ROWS", () => {
  test("the Ukrainian keyboard has all 33 letters and the apostrophe", () => {
    const keys = KEYBOARD_ROWS.uk.flat();

    expect(keys).toHaveLength(34);
    expect([...keys].sort()).toEqual([..."абвгґдеєжзиіїйклмнопрстуфхцчшщьюя’"].sort());
  });

  test("the English keyboard has all 26 letters and the apostrophe", () => {
    expect(new Set(KEYBOARD_ROWS.en.flat()).size).toBe(27);
  });
});
