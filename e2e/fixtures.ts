import { test as base } from "@playwright/test";

export { expect, type Page } from "@playwright/test";

/**
 * Every page gets silent speech. `--mute-audio` (playwright.config.ts) mutes only the page's own
 * sound: on a Mac the browser's voices speak through the system, out loud. Each phrase ends at
 * once; a test that checks what is said puts its own voices over these.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() => {
      window.speechSynthesis.speak = (utterance) => {
        setTimeout(() => utterance.onend?.(new Event("end") as SpeechSynthesisEvent));
      };
    });
    await use(context);
  },
});
