import { useEffect, useMemo, useState } from 'react'
import DeckGL from '@deck.gl/react'
import GUI from 'lil-gui'
import type { Layer, MapViewState } from '@deck.gl/core'
import { INITIAL_VIEW_STATE } from './config'
import { DEFAULT_SOURCE } from './data/sources'
import { computeHeightmap } from './data/field'
import ContourTerrainLayer from './layers/ContourTerrainLayer'
import { seoulBoundaryLayer } from './layers/seoulBoundaryLayer'
import type { GeoPoint } from './data/types'

type Controls = { count: number; height: number; lineColor: string; peakColor: string }
const DEFAULT_CONTROLS: Controls = { count: 16, height: 4000, lineColor: '#fbbf24', peakColor: '#7dd3fc' }

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function App() {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE)
  const [points, setPoints] = useState<GeoPoint[] | null>(null)
  const [controls, setControls] = useState<Controls>(DEFAULT_CONTROLS)

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
    const gui = new GUI({ title: 'contours' })
    const state = { ...DEFAULT_CONTROLS }
    const sync = () => setControls({ ...state })
    gui.add(state, 'count', 4, 40, 1).name('line count').onChange(sync)
    gui.add(state, 'height', 0, 10000, 100).name('height').onChange(sync)
    gui.addColor(state, 'lineColor').name('line color').onChange(sync)
    gui.addColor(state, 'peakColor').name('peak color').onChange(sync)
    return () => gui.destroy()
  }, [])

  // Heightmap only depends on data — keep it out of the controls memo so tweaking
  // interval/colors doesn't re-run the (expensive) KDE + mask.
  const heightmap = useMemo(
    () => (points ? computeHeightmap(points, DEFAULT_SOURCE.bounds, { hour: null }) : null),
    [points],
  )

  const layers = useMemo<Layer[]>(() => {
    // Seoul outline sits under the terrain so the city's shape is always visible,
    // even before data loads or where the KDE field is flat.
    const boundary = seoulBoundaryLayer()
    if (!heightmap) return [boundary]
    return [
      boundary,
      new ContourTerrainLayer({
        id: 'terrain',
        heightmap,
        interval: 1 / controls.count,
        heightScale: controls.height,
        lineColor: hexToRgb(controls.lineColor),
        peakColor: hexToRgb(controls.peakColor),
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
