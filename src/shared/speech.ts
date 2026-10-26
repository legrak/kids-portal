/** The browser's voice for a language ("uk", "en"), if it has one. */
export function voiceFor(lang: string): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis
    ?.getVoices()
    .find((voice) => voice.lang.toLowerCase().replace("_", "-").startsWith(lang));
}

// Browsers load the voices in the background; asking early has them ready by the first question.
window.speechSynthesis?.getVoices();
