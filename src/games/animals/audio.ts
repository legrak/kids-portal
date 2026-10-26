import { allowSoundWithRingerOff } from "../../shared/sound";
import { type Phrase, say } from "../../shared/speech";
import type { AnimalSound } from "./data/animals";

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
 * player has played inside a tap.
 */
export function unlockAudio(): void {
  const audio = getPlayer();
  if (!audio.src) {
    audio.src = silence();
    void audio.play().catch(() => {});
  }
  allowSoundWithRingerOff();
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

/** Asks aloud where the animal is, in the voices the browser has, then plays its sound. */
export function askAbout(question: readonly Phrase[], sound: AnimalSound): void {
  const ask = ++current;
  player?.pause();
  say(question, () => {
    if (ask !== current) return;
    current++;
    // After a timeout the voice may still be speaking, or only starting.
    window.speechSynthesis?.cancel();
    play(sound);
  });
}

/**
 * Starts loading an animal's photo, so the next round shows at once. Sounds are not loaded ahead:
 * iOS ignores it, and elsewhere it would fetch whole recordings of which a few seconds play.
 */
export function preloadPhoto(url: string): void {
  new Image().src = url;
}
