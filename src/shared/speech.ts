/** If the voice never says it has finished, the speech counts as over after this. */
const SPEECH_TIMEOUT_MS = 6000;

/** A phrase to say, and the language of the voice to say it in ("uk", "en"). */
export interface Phrase {
  text: string;
  lang: string;
}

/**
 * Joke and robot voices that macOS and iOS list among the English ones (bells, bubbles, a
 * whisper, old synthesizers): a little kid must hear a person.
 */
const ODD_VOICES = new Set([
  "Albert",
  "Bad News",
  "Bahh",
  "Bells",
  "Boing",
  "Bubbles",
  "Cellos",
  "Eddy",
  "Flo",
  "Fred",
  "Good News",
  "Grandma",
  "Grandpa",
  "Jester",
  "Junior",
  "Kathy",
  "Organ",
  "Ralph",
  "Reed",
  "Rocko",
  "Sandy",
  "Shelley",
  "Superstar",
  "Trinoids",
  "Whisper",
  "Wobble",
  "Zarvox",
]);

/** Some voices carry their language in the name, as "Eddy (English (US))". */
const baseName = (voice: SpeechSynthesisVoice) => voice.name.split(" (")[0] ?? voice.name;

/** The voice for a language among these: the system's default one if it speaks it, else the first. */
export function pickVoice(
  voices: readonly SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | undefined {
  const speaking = voices.filter(
    (voice) =>
      voice.lang.toLowerCase().replace("_", "-").startsWith(lang) &&
      !ODD_VOICES.has(baseName(voice)),
  );
  return speaking.find((voice) => voice.default) ?? speaking[0];
}

/** The browser's voice for a language ("uk", "en"), if it has one. */
export function voiceFor(lang: string): SpeechSynthesisVoice | undefined {
  const speech = globalThis.speechSynthesis;
  return speech ? pickVoice(speech.getVoices(), lang) : undefined;
}

/**
 * Says the phrases one after another, each in a voice of its language, and cuts off what was
 * being said. A phrase in a language the browser has no voice for is left out. `onDone` runs once
 * the last phrase is said, or cut off, and at once when there is nothing to say.
 */
export function say(phrases: readonly Phrase[], onDone?: () => void): void {
  const speech = globalThis.speechSynthesis;
  let last: SpeechSynthesisUtterance | undefined;
  speech?.cancel();
  for (const { text, lang } of phrases) {
    const voice = voiceFor(lang);
    if (!speech || !voice) continue;
    last = new SpeechSynthesisUtterance(text);
    last.voice = voice;
    last.lang = voice.lang;
    last.rate = 0.9;
    speech.speak(last);
  }
  if (!onDone) return;
  if (!last) {
    onDone();
    return;
  }
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(timeout);
    onDone();
  };
  const timeout = setTimeout(finish, SPEECH_TIMEOUT_MS);
  last.onend = finish;
  last.onerror = finish;
}

// Browsers load the voices in the background; asking early has them ready by the first question.
globalThis.speechSynthesis?.getVoices();
