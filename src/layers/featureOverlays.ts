import { GeoJsonLayer } from '@deck.gl/layers'

// River + park reference overlays, drawn flat at ground level (z=0) beneath the
// contour terrain — same backdrop-plate role as the Seoul boundary. The GeoJSON
// is fetched at runtime from public/geo/ (reprojected EPSG:5174→WGS84 and
// simplified by scripts/prepareGeoFeatures.ts). `depthTest: false` keeps them as
// a clean plate under the terrain relief.

const RIVER_URL = `${import.meta.env.BASE_URL}geo/seoul_river.geojson`
const PARK_URL = `${import.meta.env.BASE_URL}geo/seoul_park.geojson`

export type FeatureOverlayOptions = {
  /** Fill color, RGBA 0–255. */
  fillColor?: [number, number, number, number]
}

/** Han river + other water bodies, faint blue fill on the ground plane. */
export function riverLayer({
  fillColor = [56, 132, 176, 90],
}: FeatureOverlayOptions = {}): GeoJsonLayer {
  return new GeoJsonLayer({
    id: 'seoul-river',
    data: RIVER_URL,
    stroked: false,
    filled: true,
    getFillColor: fillColor,
    updateTriggers: { getFillColor: fillColor },
    parameters: { depthTest: false },
  })
}

/** City parks, faint green fill on the ground plane. */
export function parkLayer({
  fillColor = [74, 134, 88, 80],
}: FeatureOverlayOptions = {}): GeoJsonLayer {
  return new GeoJsonLayer({
    id: 'seoul-park',
    data: PARK_URL,
    stroked: false,
    filled: true,
    getFillColor: fillColor,
    updateTriggers: { getFillColor: fillColor },
    parameters: { depthTest: false },
  })
}
