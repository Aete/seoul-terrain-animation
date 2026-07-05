import { useEffect, useMemo, useState } from 'react'
import DeckGL from '@deck.gl/react'
import type { Layer, MapViewState } from '@deck.gl/core'
import { INITIAL_VIEW_STATE } from './config'
import { DEFAULT_SOURCE } from './data/sources'
import { computeHeightmap } from './data/field'
import ContourTerrainLayer from './layers/ContourTerrainLayer'
import type { GeoPoint } from './data/types'

function App() {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE)
  const [points, setPoints] = useState<GeoPoint[] | null>(null)

  useEffect(() => {
    let alive = true
    DEFAULT_SOURCE.load().then((p) => {
      if (alive) setPoints(p)
    })
    return () => {
      alive = false
    }
  }, [])

  const layers = useMemo<Layer[]>(() => {
    if (!points) return []
    const heightmap = computeHeightmap(points, DEFAULT_SOURCE.bounds, { hour: null })
    return [new ContourTerrainLayer({ id: 'terrain', heightmap })]
  }, [points])

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
