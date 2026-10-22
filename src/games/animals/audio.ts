import type { AnimalSound } from "./data/animals";

/** If the voice never says it has finished, the animal's sound starts after this anyway. */
const SPEECH_TIMEOUT_MS = 3000;

let player: HTMLAudioElement | null = null;
/** Bumped by every new sound or question, so a late callback of an old one does nothing. */
let current = 0;

function getPlayer(): HTMLAudioElement {
  player ??= new Audio();
  return player;
}

/** A tiny silent WAV, to start the player from a tap. */
function silence(): string {
  const view = new DataView(new ArrayBuffer(46));
  const text = (offset: number, value: string) => {
    for (const [i, char] of [...value].entries()) view.setUint8(offset + i, char.charCodeAt(0));
  };
  text(0, "RIFF");
  view.setUint32(4, 38, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, 8000, true);
  view.setUint32(28, 16000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, 2, true);
  return URL.createObjectURL(new Blob([view], { type: "audio/wav" }));
}

/**
 * Must run inside a tap. iOS lets a page play sound later, from a timer, only once the same
 * player has played inside a tap; it also mutes Web Audio with the ringer switch unless told
 * that the page plays sound on purpose.
 */
export function unlockAudio(): void {
  const audio = getPlayer();
  if (!audio.src) {
    audio.src = silence();
    void audio.play().catch(() => {});
  }
  const session = (navigator as { audioSession?: { type: string } }).audioSession;
  if (session) session.type = "playback";
}

const clipUrl = ({ url, start, end }: AnimalSound) =>
  start === undefined ? url : `${url}#t=${start}${end === undefined ? "" : `,${end}`}`;

function play(sound: AnimalSound): void {
  const audio = getPlayer();
  audio.src = clipUrl(sound);
  void audio.play().catch(() => {});
}

export function playAnimalSound(sound: AnimalSound): void {
  current++;
  window.speechSynthesis?.cancel();
  play(sound);
}

export function stopAnimalSounds(): void {
  current++;
  window.speechSynthesis?.cancel();
  player?.pause();
}

function ukrainianVoice(): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis
    ?.getVoices()
    .find((voice) => voice.lang.toLowerCase().replace("_", "-").startsWith("uk"));
}

// Browsers load the voices in the background; asking early has them ready by the first question.
window.speechSynthesis?.getVoices();

/** Asks aloud where the animal is, when the browser has a Ukrainian voice, then plays its sound. */
export function askAbout(name: string, sound: AnimalSound): void {
  const ask = ++current;
  player?.pause();
  const voice = ukrainianVoice();
  if (!voice) {
    play(sound);
    return;
  }
  const playOnce = () => {
    window.clearTimeout(timeout);
    if (ask === current) {
      current++;
      // After the timeout the voice may still be speaking, or only starting.
      window.speechSynthesis.cancel();
      play(sound);
    }
  };
  const timeout = window.setTimeout(playOnce, SPEECH_TIMEOUT_MS);
  const question = new SpeechSynthesisUtterance(`Де ${name}?`);
  question.voice = voice;
  question.lang = voice.lang;
  question.rate = 0.9;
  question.onend = playOnce;
  question.onerror = playOnce;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(question);
}

/**
 * Starts loading an animal's photo, so the next round shows at once. Sounds are not loaded ahead:
 * iOS ignores it, and elsewhere it would fetch whole recordings of which a few seconds play.
 */
export function preloadPhoto(url: string): void {
  new Image().src = url;
}
