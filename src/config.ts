import type { MapViewState } from '@deck.gl/core'

/** CARTO dark-matter basemap style (no token required). */
export const BASEMAP_STYLE =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

/** Initial camera over Seoul: high pitch for the "contour poster" look. */
export const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 127.02,
  latitude: 37.55,
  zoom: 10.5,
  pitch: 60,
  bearing: -20,
}

/** App background (matches index.css --bg). */
export const BG_COLOR = '#0a0e1a'
