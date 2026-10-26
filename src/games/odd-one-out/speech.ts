import { type GameLanguage, phrasesIn, type Words } from "../../shared/language";
import { type Phrase, say } from "../../shared/speech";
import { type Category, categoryById, type Thing } from "./data/things";

/** The explanation waits for the happy melody to end. */
const EXPLAIN_AFTER_MS = 700;

let explainTimer = 0;

/** Keeps a dash, or the "а" before a name, from starting or ending a line on the screen. */
const NBSP = "\u00a0";

const capitalized = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** What the thing is: "яблуко — це фрукт", "the apple is a fruit". */
function whatItIs(thing: Thing): Words {
  const category = categoryById(thing.category);
  const en = thing.enIsPlural
    ? `the ${thing.en} are ${category.enPlural ?? category.isA.en}`
    : `the ${thing.en} is ${category.isA.en}`;
  return { uk: `${thing.uk}${NBSP}— ${category.isA.uk}`, en };
}

/** The question: "Що тут зайве?", "Which one doesn't belong?" or both. */
export const questionFor = (language: GameLanguage): Phrase[] =>
  phrasesIn(language, { uk: "Що тут зайве?", en: "Which one doesn't belong?" });

/** After the odd one is found: what the three are, and what the odd one is. */
export function explanationFor(group: Category, odd: Thing, language: GameLanguage): Phrase[] {
  const oddIs = whatItIs(odd);
  return phrasesIn(language, {
    uk: `Так! ${group.these.uk}, а${NBSP}${oddIs.uk}.`,
    en: `Yes! ${group.these.en}, and ${oddIs.en}.`,
  });
}

/** After a wrong pick: what the thing is, then the question again. */
export function wrongPickFor(picked: Thing, language: GameLanguage): Phrase[] {
  const pickedIs = whatItIs(picked);
  return phrasesIn(language, {
    uk: `${capitalized(pickedIs.uk)}. Що тут зайве?`,
    en: `${capitalized(pickedIs.en)}. Which one doesn't belong?`,
  });
}

function sayNow(phrases: Phrase[]): void {
  window.clearTimeout(explainTimer);
  say(phrases);
}

export function ask(language: GameLanguage): void {
  sayNow(questionFor(language));
}

export function sayWrongPick(picked: Thing, language: GameLanguage): void {
  sayNow(wrongPickFor(picked, language));
}

/** Says why the odd one is odd, once the happy melody is over; `onDone` runs when it is said. */
export function explain(
  group: Category,
  odd: Thing,
  language: GameLanguage,
  onDone: () => void,
): void {
  stopSpeaking();
  explainTimer = window.setTimeout(
    () => say(explanationFor(group, odd, language), onDone),
    EXPLAIN_AFTER_MS,
  );
}

export function stopSpeaking(): void {
  window.clearTimeout(explainTimer);
  window.speechSynthesis?.cancel();
}
