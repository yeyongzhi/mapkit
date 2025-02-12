import { DynamicDataLayers, FacilityLayer } from '@mapkit/layers'

function App() {
  return (
    <>
      <h2>{FacilityLayer()}</h2>
      <h2>{DynamicDataLayers()}</h2>
    </>
  )
}

export default App
