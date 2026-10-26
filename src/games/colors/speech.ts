import { type GameLanguage, phrasesIn } from "../../shared/language";
import { type Phrase, say } from "../../shared/speech";
import type { Color } from "./data/colors";

/** The praise waits for the happy melody to end. */
const PRAISE_AFTER_MS = 700;

let praiseTimer = 0;

/** The question: "Де синій?", "Where is blue?" or both. */
export const questionFor = (color: Color, language: GameLanguage): Phrase[] =>
  phrasesIn(language, { uk: `Де ${color.uk}?`, en: `Where is ${color.en}?` });

/** The praise for a found colour. */
export const praiseFor = (color: Color, language: GameLanguage): Phrase[] =>
  phrasesIn(language, { uk: `Так, це ${color.uk}!`, en: `Yes, it's ${color.en}!` });

/** After a wrong balloon: its colour, then the question again. */
export const wrongPickFor = (picked: Color, asked: Color, language: GameLanguage): Phrase[] =>
  phrasesIn(language, {
    uk: `Це ${picked.uk}. Де ${asked.uk}?`,
    en: `That's ${picked.en}. Where is ${asked.en}?`,
  });

function sayNow(phrases: Phrase[]): void {
  window.clearTimeout(praiseTimer);
  say(phrases);
}

export function askFor(color: Color, language: GameLanguage): void {
  sayNow(questionFor(color, language));
}

export function sayWrongPick(picked: Color, asked: Color, language: GameLanguage): void {
  sayNow(wrongPickFor(picked, asked, language));
}

/** Names the found colour once the happy melody is over; `onDone` runs when the praise is said. */
export function praise(color: Color, language: GameLanguage, onDone: () => void): void {
  stopSpeaking();
  praiseTimer = window.setTimeout(() => say(praiseFor(color, language), onDone), PRAISE_AFTER_MS);
}

export function stopSpeaking(): void {
  window.clearTimeout(praiseTimer);
  window.speechSynthesis?.cancel();
}
