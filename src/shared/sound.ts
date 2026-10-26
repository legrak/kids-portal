export type SoundName = "correct" | "wrong" | "hint" | "roundEnd";

interface Note {
  /** Frequency in Hz. */
  frequency: number;
  /** Start, seconds from now. */
  at: number;
  /** Length in seconds. */
  length: number;
}

const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;
const G4 = 392;

const MELODIES: Record<SoundName, { wave: OscillatorType; volume: number; notes: Note[] }> = {
  correct: {
    wave: "triangle",
    volume: 0.25,
    notes: [
      { frequency: C5, at: 0, length: 0.12 },
      { frequency: E5, at: 0.09, length: 0.12 },
      { frequency: G5, at: 0.18, length: 0.12 },
      { frequency: C6, at: 0.27, length: 0.35 },
    ],
  },
  wrong: {
    wave: "sine",
    volume: 0.2,
    notes: [
      { frequency: 330, at: 0, length: 0.14 },
      { frequency: 247, at: 0.13, length: 0.24 },
    ],
  },
  hint: {
    wave: "sine",
    volume: 0.18,
    notes: [
      { frequency: 1318.5, at: 0, length: 0.08 },
      { frequency: 1760, at: 0.07, length: 0.25 },
    ],
  },
  roundEnd: {
    wave: "triangle",
    volume: 0.25,
    notes: [
      { frequency: G4, at: 0, length: 0.14 },
      { frequency: C5, at: 0.14, length: 0.14 },
      { frequency: E5, at: 0.28, length: 0.14 },
      { frequency: G5, at: 0.42, length: 0.22 },
      { frequency: E5, at: 0.64, length: 0.12 },
      { frequency: G5, at: 0.76, length: 0.5 },
    ],
  },
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof AudioContext === "undefined") return null;
  audioContext ??= new AudioContext();
  // Browsers start the context suspended until the page gets a click or a key press, and iOS
  // interrupts it when the screen locks or another app plays.
  if (audioContext.state !== "running") void audioContext.resume();
  return audioContext;
}

/**
 * Tells iOS that the page plays sound on purpose: otherwise the ringer switch mutes the
 * synthesized melodies.
 */
export function allowSoundWithRingerOff(): void {
  const session = (navigator as { audioSession?: { type: string } }).audioSession;
  if (session) session.type = "playback";
}

/** Plays a short synthesized melody; does nothing where Web Audio is not available. */
export function playSound(name: SoundName): void {
  const context = getAudioContext();
  if (!context) return;
  const { wave, volume, notes } = MELODIES[name];
  const now = context.currentTime;
  for (const note of notes) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.value = note.frequency;
    const start = now + note.at;
    const end = start + note.length;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.05);
  }
}
