import { type GameLanguage, phrasesIn } from "../../shared/language";
import type { Phrase } from "../../shared/speech";
import type { Animal } from "./data/animals";

const withArticle = (name: string) => `${/^[aeiou]/.test(name) ? "an" : "a"} ${name}`;

/** The question: "Де корова?", "Where is the cow?" or both. */
export const questionFor = (animal: Animal, language: GameLanguage): Phrase[] =>
  phrasesIn(language, { uk: `Де ${animal.uk}?`, en: `Where is the ${animal.en}?` });

/** Shown once the animal is found: "Це корова!", "It's a cow!" or both. */
export const foundFor = (animal: Animal, language: GameLanguage): Phrase[] =>
  phrasesIn(language, { uk: `Це ${animal.uk}!`, en: `It's ${withArticle(animal.en)}!` });
