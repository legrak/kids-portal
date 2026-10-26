import type { Page } from "./fixtures";

export const BOTH_VOICES = ["uk-UA", "en-GB"];

/**
 * Voices that write down what they are told to say. The phrases are said one after another, 2 s
 * each, and cutting the speech off ends a phrase with an error, as in Chrome. Added to the
 * context, after the silent speech of e2e/fixtures.ts, so these voices win.
 */
export async function recordSpeech(page: Page, langs = BOTH_VOICES) {
  await page.context().addInitScript((langs) => {
    const spoken: string[] = [];
    Object.assign(window, { spoken });
    const voices = langs.map((lang) => ({ name: lang, lang, default: false }));
    const speaking = new Set<SpeechSynthesisUtterance>();
    let queueEnd = 0;
    window.speechSynthesis.getVoices = () => voices as SpeechSynthesisVoice[];
    window.speechSynthesis.speak = (utterance) => {
      spoken.push(utterance.text);
      speaking.add(utterance);
      queueEnd = Math.max(Date.now(), queueEnd) + 2000;
      setTimeout(() => {
        if (speaking.delete(utterance)) utterance.onend?.(new Event("end") as SpeechSynthesisEvent);
      }, queueEnd - Date.now());
    };
    window.speechSynthesis.cancel = () => {
      for (const utterance of speaking) {
        setTimeout(() => utterance.onerror?.(new Event("error") as SpeechSynthesisErrorEvent));
      }
      speaking.clear();
      queueEnd = 0;
    };
    // A real utterance accepts only a real voice.
    window.SpeechSynthesisUtterance = class {
      text: string;
      constructor(text: string) {
        this.text = text;
      }
    } as unknown as typeof SpeechSynthesisUtterance;
  }, langs);
}

/** What the voices of `recordSpeech` were told to say, in order. */
export const spoken = (page: Page) =>
  page.evaluate(() => (window as unknown as { spoken: string[] }).spoken);
