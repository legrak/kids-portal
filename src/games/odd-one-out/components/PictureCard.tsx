import { pictureUrl } from "../data/things";

interface PictureCardProps {
  thingId: string;
  /** The card's place on the screen, from 1: names it without giving the thing away. */
  place: number;
  /** After the odd one is found, it stands out, and the three of one category shrink a little. */
  state: "asking" | "odd" | "group";
  /** Changes on every wrong tap on this card, to shake it again. */
  shakeKey: number;
  onPick: () => void;
}

/** A picture to tap. */
export function PictureCard({ thingId, place, state, shakeKey, onPick }: PictureCardProps) {
  return (
    <div
      key={shakeKey}
      className={`h-full w-full transition duration-500 ${
        state === "group"
          ? "scale-90"
          : state === "asking"
            ? shakeKey > 0
              ? "animate-shake"
              : "animate-flag-in"
            : ""
      }`}
    >
      <button
        type="button"
        onClick={onPick}
        // A long press on a phone would open the image menu (save, share) instead of picking.
        onContextMenu={(event) => event.preventDefault()}
        data-thing={thingId}
        aria-label={`Картинка ${place}`}
        className={`flex h-full w-full items-center justify-center rounded-3xl p-[12%] shadow-xl ring-4 transition active:scale-95 ${
          state === "odd"
            ? "bg-emerald-50 ring-emerald-400"
            : state === "group"
              ? "bg-violet-100 ring-violet-200"
              : "bg-white ring-white hover:ring-violet-300"
        }`}
      >
        <img
          src={pictureUrl(thingId)}
          alt=""
          draggable={false}
          className="h-full w-full object-contain select-none [-webkit-touch-callout:none]"
        />
      </button>
    </div>
  );
}
