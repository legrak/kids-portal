import { describe, expect, test } from "bun:test";
import { cellsToText, fitToSlots, isComplete, letterCount, slotCells } from "./slots";

describe("letterCount", () => {
  test("counts letters only", () => {
    expect(letterCount("Франція")).toBe(7);
    expect(letterCount("Кот-д’Івуар")).toBe(9);
    expect(letterCount("Нова Зеландія")).toBe(12);
  });
});

describe("slotCells", () => {
  test("keeps separators in place and leaves the rest empty", () => {
    expect(slotCells("Сан-Марино", 0, "")).toEqual([
      { kind: "empty" },
      { kind: "empty" },
      { kind: "empty" },
      { kind: "separator", char: "-" },
      { kind: "empty" },
      { kind: "empty" },
      { kind: "empty" },
      { kind: "empty" },
      { kind: "empty" },
      { kind: "empty" },
    ]);
  });

  test("shows revealed letters first and fills the next slots with typed letters", () => {
    const cells = slotCells("Нова Зеландія", 2, "вазел");

    expect(cells.slice(0, 8)).toEqual([
      { kind: "revealed", char: "Н" },
      { kind: "revealed", char: "о" },
      { kind: "typed", char: "в" },
      { kind: "typed", char: "а" },
      { kind: "separator", char: " " },
      { kind: "typed", char: "з" },
      { kind: "typed", char: "е" },
      { kind: "typed", char: "л" },
    ]);
    expect(cells[8]).toEqual({ kind: "empty" });
    expect(isComplete(cells)).toBe(false);
  });

  test("a full set of slots reads back as the answer", () => {
    const cells = slotCells("Кот-д’Івуар", 1, "отдівуар");

    expect(isComplete(cells)).toBe(true);
    expect(cellsToText(cells)).toBe("Кот-д’івуар");
  });
});

describe("fitToSlots", () => {
  test("drops separators and whatever does not fit", () => {
    expect(fitToSlots("сан марино", "Сан-Марино", 0)).toBe("санмарино");
    expect(fitToSlots("франціяя", "Франція", 0)).toBe("франція");
    expect(fitToSlots("ранція", "Франція", 1)).toBe("ранція");
    expect(fitToSlots("ранціяя", "Франція", 1)).toBe("ранція");
    expect(fitToSlots("abc", "Іран", 4)).toBe("");
  });

  test("skips the revealed letters when the kid types the whole name", () => {
    expect(fitToSlots("швейцарія", "Швейцарія", 1)).toBe("вейцарія");
    expect(fitToSlots("італія", "Швейцарія", 1)).toBe("італія");
    expect(fitToSlots("вейцарія", "Швейцарія", 1)).toBe("вейцарія");
  });

  test("keeps letters only, so stray quotes and symbols take no slot", () => {
    expect(fitToSlots("‘єтнам", "В’єтнам", 1)).toBe("єтнам");
    expect(fitToSlots("фран?ція", "Франція", 0)).toBe("франція");
    expect(fitToSlots("кита\u0438\u0306", "Китай", 0)).toBe("китай");
  });
});
