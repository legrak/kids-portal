import confetti from "canvas-confetti";

const COLORS = ["#8b5cf6", "#d946ef", "#f59e0b", "#10b981", "#38bdf8", "#f43f5e"];

/** Confetti for a right answer; a bigger burst from both sides for a finished round. */
export function celebrate(size: "answer" | "round"): void {
  const shared = { colors: COLORS, disableForReducedMotion: true, zIndex: 50 };
  if (size === "answer") {
    void confetti({
      ...shared,
      particleCount: 90,
      spread: 75,
      startVelocity: 40,
      origin: { y: 0.6 },
    });
    return;
  }
  for (const x of [0.1, 0.9]) {
    void confetti({
      ...shared,
      particleCount: 120,
      angle: x < 0.5 ? 60 : 120,
      spread: 70,
      startVelocity: 55,
      origin: { x, y: 0.7 },
    });
  }
}
