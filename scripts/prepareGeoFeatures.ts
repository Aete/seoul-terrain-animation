/**
 * Reproject the raw river/park GeoJSON (EPSG:5174, meters) to WGS84 lng/lat,
 * simplify, trim coordinate precision, and write compact files to `public/geo/`
 * for the app to fetch at runtime.
 *
 *   npx tsx scripts/prepareGeoFeatures.ts
 *
 * Standalone (no app imports); Seoul bounds duplicated here on purpose, per
 * scripts/CLAUDE.md. Source CRS is declared in each file's `crs` block as
 * EPSG:5174 (Korea 2000 / Central Belt, Bessel datum).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import proj4 from 'proj4'
import simplify from '@turf/simplify'
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// EPSG:5174 — Korea 2000 / Modified Central Belt, Bessel 1841 ellipsoid, with the
// datum shift to WGS84. Central meridian carries the historic +2.5" offset.
const EPSG_5174 =
  '+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 ' +
  '+ellps=bessel +units=m +no_defs ' +
  '+towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43'
const toWgs84 = proj4(EPSG_5174, 'WGS84')

/** Round to 6 decimals (~0.1 m) — plenty for a flat reference overlay. */
const round6 = (n: number) => Math.round(n * 1e6) / 1e6

/** Recursively reproject every [x, y] leaf of a nested coordinate array. */
function reprojectCoords(coords: number[] | unknown[]): unknown {
  if (typeof coords[0] === 'number') {
    const [lng, lat] = toWgs84.forward(coords as [number, number])
    return [round6(lng), round6(lat)]
  }
  return (coords as unknown[]).map((c) => reprojectCoords(c as unknown[]))
}

function reprojectGeometry(geom: Geometry): Geometry {
  if (geom.type === 'GeometryCollection') {
    return { ...geom, geometries: geom.geometries.map(reprojectGeometry) }
  }
  return { ...geom, coordinates: reprojectCoords(geom.coordinates) as never }
}

type Job = { inFile: string; outFile: string; tolerance: number }

const JOBS: Job[] = [
  // River: coarse geometry, keep it fairly faithful.
  { inFile: 'data/seoul_river.geojson', outFile: 'public/geo/seoul_river.geojson', tolerance: 0.0001 },
  // Park: 5.2 MB, hundreds of small polygons — simplify harder for size/perf.
  { inFile: 'data/seoul_park.geojson', outFile: 'public/geo/seoul_park.geojson', tolerance: 0.0002 },
]

function bboxOf(fc: FeatureCollection): [number, number, number, number] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  const scan = (c: unknown): void => {
    if (typeof (c as Position)[0] === 'number') {
      const [x, y] = c as Position
      minX = Math.min(minX, x); minY = Math.min(minY, y)
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y)
    } else (c as unknown[]).forEach(scan)
  }
  for (const f of fc.features) if (f.geometry && 'coordinates' in f.geometry) scan(f.geometry.coordinates)
  return [minX, minY, maxX, maxY]
}

mkdirSync(resolve(ROOT, 'public/geo'), { recursive: true })

for (const { inFile, outFile, tolerance } of JOBS) {
  const raw = JSON.parse(readFileSync(resolve(ROOT, inFile), 'utf8')) as FeatureCollection
  let collapsed = 0
  const features: Feature[] = raw.features.map((f) => {
    const reprojected: Feature = { ...f, geometry: reprojectGeometry(f.geometry) }
    try {
      // highQuality: false = Douglas-Peucker, fine for a background overlay.
      return simplify(reprojected, { tolerance, highQuality: false, mutate: true })
    } catch {
      // A tiny polygon collapsed below 4 points at this tolerance — keep the
      // reprojected-but-unsimplified geometry rather than dropping the feature.
      collapsed++
      return reprojected
    }
  })
  if (collapsed) console.log(`  (${collapsed} features too small to simplify — kept as-is)`)
  // Drop the source CRS block — output is now plain WGS84 (GeoJSON default).
  const out: FeatureCollection = { type: 'FeatureCollection', features }
  const json = JSON.stringify(out)
  writeFileSync(resolve(ROOT, outFile), json)
  const [minX, minY, maxX, maxY] = bboxOf(out)
  const kb = (json.length / 1024).toFixed(0)
  console.log(
    `${inFile} → ${outFile}\n` +
      `  features: ${features.length}, size: ${kb} KB\n` +
      `  bbox: [${minX.toFixed(4)}, ${minY.toFixed(4)}, ${maxX.toFixed(4)}, ${maxY.toFixed(4)}]`,
  )
}