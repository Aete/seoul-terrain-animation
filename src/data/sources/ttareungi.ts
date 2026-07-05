import type { DataSource, GeoPoint } from '../types'
import { SEOUL_BOUNDS } from '../../config'
// Bundled at build time as a raw string (Vite ?raw). Regenerate with
// `npx tsx scripts/generateMockStations.ts`.
import csv from '../../../data/sample_stations.csv?raw'

/**
 * Parse the mock CSV (lng,lat,tripCount,h0..h23) into source-agnostic GeoPoints.
 * Ttareungi-specific field mapping lives here and nowhere else:
 *   tripCount -> weight, [h0..h23] -> weightByHour.
 */
function parse(text: string): GeoPoint[] {
  const lines = text.trim().split(/\r?\n/)
  return lines.slice(1).map((line) => {
    const c = line.split(',').map(Number)
    return {
      lng: c[0],
      lat: c[1],
      weight: c[2],
      weightByHour: c.slice(3, 27),
    }
  })
}

export const ttareungiSource: DataSource = {
  id: 'ttareungi',
  label: '따릉이 대여량',
  unit: 'trips',
  bounds: SEOUL_BOUNDS,
  load: async () => parse(csv),
}
