import { memo, Suspense, use, useState } from "react";
import { COUNTRIES, type Region } from "../data/countries";
import {
  type CountryShape,
  forgetFailedWorldShapes,
  loadWorldShapes,
  MAP_HEIGHT,
  MAP_WIDTH,
} from "./worldShapes";

const REGION_BY_ISO_NUMERIC = new Map(COUNTRIES.map((c) => [c.isoNumeric, c.region]));

/** Countries smaller than this on the map (in map units) get a ring around them. */
const SMALL_COUNTRY_SIZE = 18;
const MAX_ZOOM = 8;

interface WorldMapProps {
  isoNumeric: string;
  region: Region;
}

/** A world map without any labels, with one country highlighted and its part of the world tinted. */
export function WorldMap(props: WorldMapProps) {
  const [attempt, setAttempt] = useState(0);
  return (
    <div className="relative aspect-2/1 w-full overflow-hidden rounded-2xl bg-sky-100 ring-1 ring-sky-200">
      <Suspense fallback={<MapLoading />}>
        <LoadedMap
          key={attempt}
          {...props}
          onRetry={() => {
            forgetFailedWorldShapes();
            setAttempt((n) => n + 1);
          }}
        />
      </Suspense>
    </div>
  );
}

function MapLoading() {
  return (
    <div className="flex h-full items-center justify-center text-4xl">
      <span className="animate-spin">🌍</span>
    </div>
  );
}

function LoadedMap({ isoNumeric, region, onRetry }: WorldMapProps & { onRetry: () => void }) {
  const shapes = use(loadWorldShapes());
  const [zoomed, setZoomed] = useState(false);

  if (!shapes) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-600">
        <p>Карта не завантажилась</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-white px-4 py-1 font-bold shadow-sm"
        >
          Спробувати ще
        </button>
      </div>
    );
  }

  const target = shapes.find((shape) => shape.id === isoNumeric);
  const [centerX, centerY] = target?.center ?? [MAP_WIDTH / 2, MAP_HEIGHT / 2];
  const [width, height] = target?.size ?? [MAP_WIDTH, MAP_HEIGHT];
  const zoom = zoomed
    ? Math.min(MAX_ZOOM, Math.max(1.5, MAP_WIDTH / (width * 4), MAP_HEIGHT / (height * 4)))
    : 1;
  const isSmall = width < SMALL_COUNTRY_SIZE && height < SMALL_COUNTRY_SIZE;
  const transform = zoomed
    ? `translate(${MAP_WIDTH / 2}px, ${MAP_HEIGHT / 2}px) scale(${zoom}) translate(${-centerX}px, ${-centerY}px)`
    : "none";

  return (
    <button
      type="button"
      onClick={() => setZoomed((value) => !value)}
      aria-label={zoomed ? "Показати весь світ" : "Наблизити карту"}
      className="group block h-full w-full cursor-zoom-in"
    >
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="h-full w-full" aria-hidden="true">
        <g style={{ transform, transformOrigin: "0 0", transition: "transform 700ms ease-in-out" }}>
          <Countries shapes={shapes} region={region} />
          {target && (
            <path
              d={target.path}
              className="animate-pulse fill-rose-500 stroke-white"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          )}
          {target && isSmall && (
            <>
              <circle
                cx={centerX}
                cy={centerY}
                r={16 / zoom}
                className="fill-none stroke-rose-500"
                strokeWidth={3}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r={16 / zoom}
                className="animate-ping fill-none stroke-rose-500"
                style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                strokeWidth={3}
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </g>
      </svg>
      <span className="absolute right-2 bottom-2 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-slate-600 shadow-sm transition group-hover:scale-105">
        {zoomed ? "🌍 Увесь світ" : "🔍 Ближче"}
      </span>
    </button>
  );
}

/** All countries except the highlighted one; memoized so zooming does not redraw them. */
const Countries = memo(function Countries({
  shapes,
  region,
}: {
  shapes: CountryShape[];
  region: Region;
}) {
  return shapes.map((shape, index) => (
    <path
      // biome-ignore lint/suspicious/noArrayIndexKey: the list never changes; territories without an ISO code share the empty id
      key={`${shape.id}-${index}`}
      d={shape.path}
      className={
        REGION_BY_ISO_NUMERIC.get(shape.id) === region ? "fill-amber-200" : "fill-slate-300"
      }
      stroke="white"
      strokeWidth={0.5}
      vectorEffect="non-scaling-stroke"
    />
  ));
});
