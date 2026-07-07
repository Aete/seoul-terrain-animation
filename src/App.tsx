import { useEffect, useMemo, useState } from 'react'
import DeckGL from '@deck.gl/react'
import GUI from 'lil-gui'
import type { Layer, MapViewState } from '@deck.gl/core'
import { INITIAL_VIEW_STATE } from './config'
import { DEFAULT_SOURCE } from './data/sources'
import { computeHeightmap } from './data/field'
import ContourTerrainLayer from './layers/ContourTerrainLayer'
import { seoulBoundaryLayer } from './layers/seoulBoundaryLayer'
import { parkLayer, riverLayer } from './layers/featureOverlays'
import type { GeoPoint } from './data/types'

// Every line/fill color + opacity is live-tunable from lil-gui. Colors are hex
// strings (lil-gui's addColor widget); opacities are 0–1 and combine with the
// hex to form the RGBA the layers actually draw with.
type Controls = {
  // Contour terrain
  count: number
  height: number
  lineColor: string
  peakColor: string
  contourOpacity: number
  // Seoul administrative boundary
  boundaryLineColor: string
  boundaryLineOpacity: number
  boundaryFillColor: string
  boundaryFillOpacity: number
  // Parks
  parkColor: string
  parkOpacity: number
  // River / water
  riverColor: string
  riverOpacity: number
}

const DEFAULT_CONTROLS: Controls = {
  count: 16,
  height: 4000,
  lineColor: '#fbbf24',
  peakColor: '#7dd3fc',
  contourOpacity: 1,
  boundaryLineColor: '#94a3b8',
  boundaryLineOpacity: 1,
  boundaryFillColor: '#94a3b8',
  boundaryFillOpacity: 0.055,
  parkColor: '#4a8658',
  parkOpacity: 0.314,
  riverColor: '#3884b0',
  riverOpacity: 0.353,
}

// KDE bandwidth (meters). Wide enough that the field covers ~all of Seoul with
// relief instead of isolated peaks over flat ground — at 1800m ~92% of in-Seoul
// cells clear the contour floor and station-free edges stop reading as flat.
// Tune live via lil-gui (higher = fuller coverage, softer peaks).
const DEFAULT_SIGMA = 1800

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function hexToRgba(hex: string, opacity: number): [number, number, number, number] {
  const [r, g, b] = hexToRgb(hex)
  return [r, g, b, Math.round(opacity * 255)]
}

function App() {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE)
  const [points, setPoints] = useState<GeoPoint[] | null>(null)
  const [controls, setControls] = useState<Controls>(DEFAULT_CONTROLS)
  const [sigma, setSigma] = useState<number>(DEFAULT_SIGMA)

  useEffect(() => {
    let alive = true
    DEFAULT_SOURCE.load().then((p) => {
      if (alive) setPoints(p)
    })
    return () => {
      alive = false
    }
  }, [])

  // lil-gui panel — mirrors control values into React state so layers re-render.
  useEffect(() => {
    const gui = new GUI({ title: 'controls' })
    const state = { ...DEFAULT_CONTROLS, sigma: DEFAULT_SIGMA }
    const sync = () => setControls({ ...state })

    const contour = gui.addFolder('contours')
    contour.add(state, 'count', 4, 40, 1).name('line count').onChange(sync)
    contour.add(state, 'height', 0, 10000, 100).name('height').onChange(sync)
    // Separate from `controls` so dragging it re-runs the KDE, but color/count
    // tweaks (which share `controls`) don't.
    contour.add(state, 'sigma', 300, 2500, 50).name('KDE σ (m)').onChange(() => setSigma(state.sigma))
    contour.addColor(state, 'lineColor').name('line color').onChange(sync)
    contour.addColor(state, 'peakColor').name('peak color').onChange(sync)
    contour.add(state, 'contourOpacity', 0, 1, 0.01).name('opacity').onChange(sync)

    const boundary = gui.addFolder('seoul boundary')
    boundary.addColor(state, 'boundaryLineColor').name('line color').onChange(sync)
    boundary.add(state, 'boundaryLineOpacity', 0, 1, 0.01).name('line opacity').onChange(sync)
    boundary.addColor(state, 'boundaryFillColor').name('fill color').onChange(sync)
    boundary.add(state, 'boundaryFillOpacity', 0, 1, 0.01).name('fill opacity').onChange(sync)

    const park = gui.addFolder('park')
    park.addColor(state, 'parkColor').name('color').onChange(sync)
    park.add(state, 'parkOpacity', 0, 1, 0.01).name('opacity').onChange(sync)

    const river = gui.addFolder('river')
    river.addColor(state, 'riverColor').name('color').onChange(sync)
    river.add(state, 'riverOpacity', 0, 1, 0.01).name('opacity').onChange(sync)

    return () => gui.destroy()
  }, [])

  // Heightmap depends only on data + KDE bandwidth — keep it out of the controls
  // memo so tweaking interval/colors doesn't re-run the (expensive) KDE + mask.
  const heightmap = useMemo(
    () =>
      points
        ? computeHeightmap(points, DEFAULT_SOURCE.bounds, { hour: null, sigmaMeters: sigma })
        : null,
    [points, sigma],
  )

  const layers = useMemo<Layer[]>(() => {
    // Flat z=0 reference plate under the terrain: Seoul outline, then parks and
    // river. All stay visible before data loads or where the KDE field is flat;
    // the contour terrain (drawn last) paints its relief on top.
    const base = [
      seoulBoundaryLayer({
        lineColor: hexToRgba(controls.boundaryLineColor, controls.boundaryLineOpacity),
        fillColor: hexToRgba(controls.boundaryFillColor, controls.boundaryFillOpacity),
      }),
      parkLayer({ fillColor: hexToRgba(controls.parkColor, controls.parkOpacity) }),
      riverLayer({ fillColor: hexToRgba(controls.riverColor, controls.riverOpacity) }),
    ]
    if (!heightmap) return base
    return [
      ...base,
      new ContourTerrainLayer({
        id: 'terrain',
        heightmap,
        interval: 1 / controls.count,
        heightScale: controls.height,
        lineColor: hexToRgb(controls.lineColor),
        peakColor: hexToRgb(controls.peakColor),
        opacity: controls.contourOpacity,
      }),
    ]
  }, [heightmap, controls])

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={(e) => setViewState(e.viewState as MapViewState)}
      controller
      layers={layers}
    />
  )
}

export default App
