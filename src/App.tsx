import { useState } from 'react'
import DeckGL from '@deck.gl/react'
import { Map } from 'react-map-gl/maplibre'
import type { Layer, MapViewState } from '@deck.gl/core'
import 'maplibre-gl/dist/maplibre-gl.css'
import { BASEMAP_STYLE, INITIAL_VIEW_STATE } from './config'

function App() {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE)

  // No layers yet — section 0 renders just the dark basemap over Seoul.
  const layers: Layer[] = []

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={(e) => setViewState(e.viewState as MapViewState)}
      controller
      layers={layers}
    >
      <Map reuseMaps mapStyle={BASEMAP_STYLE} />
    </DeckGL>
  )
}

export default App
