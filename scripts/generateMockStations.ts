/**
 * Generates mock Ttareungi station data -> data/sample_stations.csv.
 * Standalone build script (run with `npx tsx scripts/generateMockStations.ts`),
 * self-contained so it needs no app imports.
 *
 * Output CSV columns: lng,lat,tripCount,h0..h23  (hourly counts sum to tripCount).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const OUT = resolve(process.cwd(), 'data/sample_stations.csv')
const N = 120

// [minLng, minLat, maxLng, maxLat] — keep in sync with SEOUL_BOUNDS in src/config.ts
const BOUNDS = [126.76, 37.42, 127.18, 37.7] as const

// Hotspot centers with a relative intensity multiplier.
const CLUSTERS = [
  { name: 'Gangnam', lng: 127.0276, lat: 37.4979, boost: 1.8 },
  { name: 'Hongdae', lng: 126.924, lat: 37.5563, boost: 1.4 },
  { name: 'Yeouido', lng: 126.9245, lat: 37.5216, boost: 1.3 },
  { name: 'Jamsil', lng: 127.1, lat: 37.5133, boost: 1.2 },
]

/** Standard normal via Box-Muller. */
function randn(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

/** Bimodal (morning 8h / evening 18h) hourly shape, per-station biased, sums to 1. */
function hourlyShape(): number[] {
  const morning = 0.7 + Math.random() * 0.6 // commuter bias varies by station
  const evening = 0.7 + Math.random() * 0.6
  const gauss = (h: number, mu: number, s: number) =>
    Math.exp(-((h - mu) ** 2) / (2 * s * s))
  const raw = Array.from({ length: 24 }, (_, h) => {
    const peaks = morning * gauss(h, 8, 2.2) + evening * gauss(h, 18, 2.6)
    const baseline = 0.06 * gauss(h, 14, 6) // gentle daytime floor
    return peaks + baseline + Math.random() * 0.02
  })
  const sum = raw.reduce((a, b) => a + b, 0)
  return raw.map((x) => x / sum)
}

type Row = { lng: number; lat: number; tripCount: number; hours: number[] }

function makeStation(): Row {
  // 60% clustered near a hotspot, 40% spread uniformly across Seoul.
  let lng: number
  let lat: number
  let boost = 1
  if (Math.random() < 0.6) {
    const c = CLUSTERS[Math.floor(Math.random() * CLUSTERS.length)]
    lng = clamp(c.lng + randn() * 0.02, BOUNDS[0], BOUNDS[2])
    lat = clamp(c.lat + randn() * 0.02, BOUNDS[1], BOUNDS[3])
    boost = c.boost
  } else {
    lng = BOUNDS[0] + Math.random() * (BOUNDS[2] - BOUNDS[0])
    lat = BOUNDS[1] + Math.random() * (BOUNDS[3] - BOUNDS[1])
  }

  // Heavy-tailed daily volume: log-normal(mu=6, sigma=1.5), scaled by hotspot boost.
  const tripCountRaw = Math.exp(6 + randn() * 1.5) * boost
  const shape = hourlyShape()
  const hours = shape.map((s) => Math.round(s * tripCountRaw))
  const tripCount = hours.reduce((a, b) => a + b, 0) // keep total consistent with hourly
  return { lng, lat, tripCount, hours }
}

const rows: Row[] = Array.from({ length: N }, makeStation)

// --- write CSV ---
const header = ['lng', 'lat', 'tripCount', ...Array.from({ length: 24 }, (_, h) => `h${h}`)]
const lines = [header.join(',')]
for (const r of rows) {
  lines.push([r.lng.toFixed(6), r.lat.toFixed(6), r.tripCount, ...r.hours].join(','))
}
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, lines.join('\n') + '\n')

// --- stats (section 1 verification) ---
const counts = rows.map((r) => r.tripCount).sort((a, b) => a - b)
const pct = (p: number) => counts[Math.floor(p * (counts.length - 1))]
const total = counts.reduce((a, b) => a + b, 0)
const peakHour = Array.from({ length: 24 }, (_, h) =>
  rows.reduce((a, r) => a + r.hours[h], 0),
).reduce((best, v, h, arr) => (v > arr[best] ? h : best), 0)

console.log(`Wrote ${rows.length} stations -> ${OUT}`)
console.log(
  `tripCount: min=${counts[0]} p50=${pct(0.5)} p99=${pct(0.99)} max=${counts.at(-1)} total=${total}`,
)
console.log(`system-wide peak hour: ${peakHour}:00`)
