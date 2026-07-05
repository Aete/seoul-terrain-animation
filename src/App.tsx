import { useState } from 'react'
import DeckGL from '@deck.gl/react'
import type { Layer, MapViewState } from '@deck.gl/core'
import { INITIAL_VIEW_STATE } from './config'

function App() {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE)

  // No basemap — the contour terrain is the focus. Dark page bg (index.css)
  // shows through deck.gl's transparent canvas. Layers added from section 4 on.
  const layers: Layer[] = []

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
