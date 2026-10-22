import { normalizeAnswer } from "./answers";

/** A character of a name that is not a letter to type: the ones answers are compared without. */
export function isSeparator(char: string): boolean {
  return normalizeAnswer(char) === "";
}

export type SlotCell =
  | { kind: "separator"; char: string }
  /** A letter shown by a hint. */
  | { kind: "revealed"; char: string }
  | { kind: "typed"; char: string }
  | { kind: "empty" };

export function letterCount(target: string): number {
  return Array.from(target).filter((char) => !isSeparator(char)).length;
}

/**
 * Lays an answer out in letter slots: separators stay in place, the first `revealedLetters`
 * letters come from the target, and the typed letters fill the remaining slots in order.
 */
export function slotCells(target: string, revealedLetters: number, typed: string): SlotCell[] {
  const typedLetters = Array.from(typed);
  let letterIndex = 0;
  return Array.from(target).map((char): SlotCell => {
    if (isSeparator(char)) return { kind: "separator", char };
    const index = letterIndex++;
    if (index < revealedLetters) return { kind: "revealed", char };
    const typedChar = typedLetters[index - revealedLetters];
    return typedChar ? { kind: "typed", char: typedChar } : { kind: "empty" };
  });
}

export function isComplete(cells: readonly SlotCell[]): boolean {
  return cells.every((cell) => cell.kind !== "empty");
}

export function cellsToText(cells: readonly SlotCell[]): string {
  return cells.map((cell) => (cell.kind === "empty" ? "" : cell.char)).join("");
}

/** Keeps only what fits the free slots: letters, at most as many as the slots left to fill. */
export function fitToSlots(typed: string, target: string, revealedLetters: number): string {
  const freeSlots = Math.max(0, letterCount(target) - revealedLetters);
  return Array.from(typed.normalize("NFC"))
    .filter((char) => /\p{L}/u.test(char))
    .slice(0, freeSlots)
    .join("");
}
