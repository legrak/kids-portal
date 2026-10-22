interface MuteButtonProps {
  muted: boolean;
  onToggle: () => void;
}

export function MuteButton({ muted, onToggle }: MuteButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={muted}
      aria-label={muted ? "Увімкнути звук" : "Вимкнути звук"}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm ring-1 ring-violet-100 transition hover:scale-110 active:scale-95"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
