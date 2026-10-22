import type { Stars as StarCount } from "../logic/game";

interface StarsProps {
  count: StarCount;
  size?: "sm" | "lg";
  /** Pops the stars in one after another. */
  animated?: boolean;
}

export function Stars({ count, size = "sm", animated = false }: StarsProps) {
  return (
    <span
      role="img"
      aria-label={`${count} з 3 зірок`}
      className={`inline-flex gap-0.5 ${size === "lg" ? "text-4xl" : "text-base"}`}
    >
      {[1, 2, 3].map((place) => (
        <span
          key={place}
          aria-hidden="true"
          style={animated ? { animationDelay: `${place * 150}ms` } : undefined}
          className={`${place <= count ? "" : "opacity-25 grayscale"} ${animated ? "animate-star-in" : ""}`}
        >
          ⭐
        </span>
      ))}
    </span>
  );
}
