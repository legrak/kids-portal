import type { RoundItem } from "../../../shared/rounds";

/** How many balloons each round shows. */
export const CHOICE_COUNT = 4;

export interface Color extends RoundItem {
  /** The Ukrainian name, as the game asks: "Де синій?" */
  uk: string;
  /** The English name, as the game asks: "Where is blue?" */
  en: string;
  /** The balloon's colour. */
  hex: string;
}

/** Colours a kid meets every day, each bright and far from the others. */
export const COLORS: readonly Color[] = [
  { id: "red", uk: "червоний", en: "red", hex: "#e53935" },
  { id: "orange", uk: "помаранчевий", en: "orange", hex: "#fb8c00" },
  { id: "yellow", uk: "жовтий", en: "yellow", hex: "#fdd835" },
  { id: "green", uk: "зелений", en: "green", hex: "#43a047" },
  // Both are "blue" in English, so they never share a round.
  { id: "lightBlue", uk: "блакитний", en: "light blue", hex: "#4fc3f7", lookalikes: "blues" },
  { id: "blue", uk: "синій", en: "blue", hex: "#1e4fd8", lookalikes: "blues" },
  { id: "purple", uk: "фіолетовий", en: "purple", hex: "#8e24aa" },
  { id: "pink", uk: "рожевий", en: "pink", hex: "#f48fb1" },
  { id: "brown", uk: "коричневий", en: "brown", hex: "#8d5524" },
  { id: "black", uk: "чорний", en: "black", hex: "#212121" },
  { id: "grey", uk: "сірий", en: "grey", hex: "#9e9e9e" },
  { id: "white", uk: "білий", en: "white", hex: "#ffffff" },
];

const COLORS_BY_ID = new Map(COLORS.map((color) => [color.id, color]));

export function colorById(id: string): Color {
  const color = COLORS_BY_ID.get(id);
  if (!color) throw new Error(`No colour ${id}`);
  return color;
}
