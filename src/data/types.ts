/**
 * Source-agnostic core data model. The whole pipeline (KDE -> heightmap ->
 * contour -> particles) depends only on these types — never on dataset-specific
 * fields like Ttareungi's `tripCount`. New datasets plug in as `DataSource`
 * adapters that map their fields onto `GeoPoint`.
 */

/** Geographic bounding box: [minLng, minLat, maxLng, maxLat]. */
export type Bounds = [number, number, number, number]

/** A weighted geographic point, optionally resolved by hour of day. */
export type GeoPoint = {
  lng: number
  lat: number
  /** Aggregate scalar (bike trips, people, riders, …). */
  weight: number
  /** Per-hour breakdown, length 24. Omit for datasets with no temporal dimension. */
  weightByHour?: number[]
}

/** A pluggable dataset. Register instances in `sources/index.ts`. */
export type DataSource = {
  id: string
  /** Human-readable name for the UI source picker. */
  label: string
  /** Unit of `weight`, e.g. 'trips', 'people'. */
  unit: string
  /** Area of interest for this dataset. */
  bounds: Bounds
  load: () => Promise<GeoPoint[]>
}

/** A scalar field sampled on a regular grid over `bounds`. */
export type Heightmap = {
  data: Float32Array
  width: number
  height: number
  bounds: Bounds
}
