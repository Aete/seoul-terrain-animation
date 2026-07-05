import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { polygon } from '@turf/helpers'
import type { Bounds } from './types'

/**
 * TEMPORARY approximate geometry. Replace with real GeoJSON later:
 *   - Seoul boundary: southkorea/seoul-maps (mapshaper-simplified)
 *   - Han river: OSM Overpass export
 * The mask machinery below is final; only these two rings are placeholders.
 */
const SEOUL_RING: [number, number][] = [
  [126.82, 37.51],
  [126.83, 37.55],
  [126.86, 37.6],
  [126.93, 37.64],
  [127.02, 37.66],
  [127.1, 37.63],
  [127.15, 37.57],
  [127.14, 37.5],
  [127.06, 37.45],
  [126.97, 37.44],
  [126.88, 37.47],
  [126.82, 37.51],
]

/** A rough band following the Han river W→E, then back E→W to close. */
const HAN_RIVER_RING: [number, number][] = [
  [126.8, 37.585],
  [126.87, 37.56],
  [126.93, 37.53],
  [126.97, 37.54],
  [127.02, 37.53],
  [127.08, 37.53],
  [127.12, 37.54],
  [127.12, 37.52],
  [127.08, 37.512],
  [127.02, 37.512],
  [126.97, 37.52],
  [126.93, 37.512],
  [126.87, 37.542],
  [126.8, 37.565],
  [126.8, 37.585],
]

const seoulPoly = polygon([SEOUL_RING])
const hanPoly = polygon([HAN_RIVER_RING])

/**
 * Rasterize "inside Seoul AND outside the Han river" onto a gridSize×gridSize grid.
 * Returns 1 for kept cells, 0 for masked-out. Row-major, same layout as the heightmap.
 * Runtime ~1–2s for 200×200; precompute to data/seoul_mask.bin before deploy.
 */
export function buildMask(bounds: Bounds, gridSize = 200): Float32Array {
  const [minLng, minLat, maxLng, maxLat] = bounds
  const spanLng = maxLng - minLng
  const spanLat = maxLat - minLat
  const mask = new Float32Array(gridSize * gridSize)

  for (let r = 0; r < gridSize; r++) {
    const lat = minLat + ((r + 0.5) / gridSize) * spanLat
    for (let c = 0; c < gridSize; c++) {
      const lng = minLng + ((c + 0.5) / gridSize) * spanLng
      const inSeoul = booleanPointInPolygon([lng, lat], seoulPoly)
      const inRiver = inSeoul && booleanPointInPolygon([lng, lat], hanPoly)
      mask[r * gridSize + c] = inSeoul && !inRiver ? 1 : 0
    }
  }
  return mask
}

/**
 * Merge a mask into a heightmap: masked-out cells become -1 so the terrain
 * fragment shader can `discard` them. Returns a new array.
 */
export function applyMask(heightmap: Float32Array, mask: Float32Array): Float32Array {
  const out = new Float32Array(heightmap.length)
  for (let i = 0; i < heightmap.length; i++) {
    out[i] = mask[i] < 0.5 ? -1 : heightmap[i]
  }
  return out
}
