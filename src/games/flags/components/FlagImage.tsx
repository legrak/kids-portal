const FLAG_URLS = import.meta.glob<string>("/node_modules/flag-icons/flags/4x3/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

export function flagUrl(code: string): string {
  const url = FLAG_URLS[`/node_modules/flag-icons/flags/4x3/${code}.svg`];
  if (!url) throw new Error(`No flag for country code: ${code}`);
  return url;
}

/** Starts loading a flag ahead of time, so it shows at once when its turn comes. */
export function preloadFlag(code: string): void {
  const image = new Image();
  image.src = flagUrl(code);
}

interface FlagImageProps {
  code: string;
  /** Alt text; must not name the country while it is the question. Empty for decoration. */
  alt: string;
  className?: string;
}

export function FlagImage({ code, alt, className = "" }: FlagImageProps) {
  return (
    <img
      src={flagUrl(code)}
      alt={alt}
      data-country={code}
      draggable={false}
      className={`aspect-4/3 w-full rounded-xl object-cover shadow-lg ring-1 ring-black/10 ${className}`}
    />
  );
}
