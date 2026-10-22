import { followLink } from "../router";

/** Back to the home page with the list of games. */
export function HomeButton() {
  return (
    <a
      href="/"
      onClick={followLink}
      aria-label="Усі ігри"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm ring-1 ring-violet-100 transition hover:scale-110 active:scale-95"
    >
      🏠
    </a>
  );
}
