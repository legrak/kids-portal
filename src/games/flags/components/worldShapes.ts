import { geoArea, geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldAtlasUrl from "world-atlas/countries-50m.json?url";

export const MAP_WIDTH = 960;
export const MAP_HEIGHT = 480;

const ANTARCTICA_ID = "010";

export interface CountryShape {
  /** ISO numeric code; empty for territories without one. */
  id: string;
  path: string;
  /** Centre of the country's largest piece of land, in map coordinates. */
  center: [number, number];
  /** Width and height of the largest piece of land, in map coordinates. */
  size: [number, number];
}

type CountryFeature = Feature<Polygon | MultiPolygon>;

/** The biggest polygon, so France is placed in Europe and not between it and French Guiana. */
function largestPolygon(country: CountryFeature): Polygon {
  const geometry = country.geometry;
  if (geometry.type === "Polygon") return geometry;
  const polygons = geometry.coordinates.map(
    (coordinates): Polygon => ({ type: "Polygon", coordinates }),
  );
  return polygons.reduce((largest, polygon) =>
    geoArea(polygon) > geoArea(largest) ? polygon : largest,
  );
}

function toShapes(topology: Topology<{ countries: GeometryCollection }>): CountryShape[] {
  const world = feature(topology, topology.objects.countries) as FeatureCollection<
    Polygon | MultiPolygon
  >;
  const countries = world.features.filter((country) => country.id !== ANTARCTICA_ID);
  const projection = geoNaturalEarth1().fitSize([MAP_WIDTH, MAP_HEIGHT], {
    type: "FeatureCollection",
    features: countries,
  });
  const toPath = geoPath(projection).digits(1);
  return countries.map((country) => {
    const mainland = largestPolygon(country);
    const [[x0, y0], [x1, y1]] = toPath.bounds(mainland);
    return {
      id: country.id === undefined ? "" : String(country.id),
      path: toPath(country) ?? "",
      center: toPath.centroid(mainland),
      size: [x1 - x0, y1 - y0],
    };
  });
}

let worldShapes: Promise<CountryShape[] | null> | null = null;

/**
 * Loads the country shapes (Natural Earth 1:50m from world-atlas) once and keeps them. Resolves
 * to null when loading fails, and keeps that until `forgetFailedWorldShapes` is called.
 */
export function loadWorldShapes(): Promise<CountryShape[] | null> {
  worldShapes ??= fetch(worldAtlasUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`World map request failed: ${response.status}`);
      return response.json();
    })
    .then(toShapes)
    .catch((error: unknown) => {
      console.error(error);
      return null;
    });
  return worldShapes;
}

/** Lets the next `loadWorldShapes` call try again after a failure. */
export function forgetFailedWorldShapes(): void {
  worldShapes = null;
}
