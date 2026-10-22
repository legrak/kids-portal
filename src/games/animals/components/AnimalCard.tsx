interface AnimalCardProps {
  animalId: string;
  photoUrl: string;
  /** Which part of the photo the 4:3 card keeps, as CSS object-position; the centre if unset. */
  photoPosition?: string;
  /** The card's place on the screen, from 1: names it without giving the animal away. */
  place: number;
  state: "asking" | "found" | "notFound";
  /** Changes on every wrong tap on this card, to shake it again. */
  shakeKey: number;
  onPick: () => void;
  onListen: () => void;
}

/** An animal photo to tap, with a button to hear the animal. */
export function AnimalCard({
  animalId,
  photoUrl,
  photoPosition,
  place,
  state,
  shakeKey,
  onPick,
  onListen,
}: AnimalCardProps) {
  return (
    // Sized to the room the card gets, keeping the photo 4:3.
    <div className="flex min-h-0 min-w-0 items-center justify-center [container-type:size]">
      <div
        key={shakeKey}
        className={`relative aspect-4/3 w-[min(100cqw,133.333cqh)] transition duration-500 ${
          state === "found"
            ? "z-10 scale-105"
            : state === "notFound"
              ? "scale-90 opacity-40"
              : shakeKey > 0
                ? "animate-shake"
                : "animate-flag-in"
        }`}
      >
        <button
          type="button"
          onClick={onPick}
          // A long press on a phone would open the image menu (save, share) instead of picking.
          onContextMenu={(event) => event.preventDefault()}
          data-animal={animalId}
          aria-label={`Тварина ${place}`}
          className={`h-full w-full overflow-hidden rounded-3xl bg-white p-1.5 shadow-xl ring-4 transition active:scale-95 ${
            state === "found" ? "ring-emerald-400" : "ring-white hover:ring-violet-300"
          }`}
        >
          <img
            src={photoUrl}
            alt=""
            draggable={false}
            style={{ objectPosition: photoPosition }}
            className="h-full w-full rounded-2xl bg-violet-50 object-cover select-none [-webkit-touch-callout:none]"
          />
        </button>
        <button
          type="button"
          onClick={onListen}
          aria-label={`Послухати тварину ${place}`}
          className="absolute right-2 bottom-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-2xl shadow-md ring-1 ring-violet-100 transition hover:scale-110 active:scale-95"
        >
          🔊
        </button>
      </div>
    </div>
  );
}
