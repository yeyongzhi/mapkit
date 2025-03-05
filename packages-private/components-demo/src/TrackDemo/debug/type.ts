enum GeometryType {
  'Point',
  'LineString',
  'Polygon',
  'MultiPoint',
  'MultiLineString',
  'MultiPolygon',
}

export interface Feature {
  type: 'Feature'
  geometry: {
    type: GeometryType | Array<GeometryType>
    coordinates: Array<Array<number>>
  }
  properties: Record<string, any>
}

export interface FeatureCollection {
  type: 'FeatureCollection'
  features: Array<Feature>
}

export type GeojsonType = FeatureCollection | Feature

export function isGeojsonType(a: any) {
  if (!a || typeof a !== 'object') return false

  // 检查是否是 Feature
  if (a.type === 'Feature') {
    return (
      typeof a.geometry?.type === 'string' &&
      Array.isArray(a.geometry?.coordinates) &&
      typeof a.properties === 'object'
    )
  }

  // 检查是否是 FeatureCollection
  if (a.type === 'FeatureCollection') {
    return Array.isArray(a.features) && a.features.every(isGeojsonType)
  }

  return false
}

export interface TrackPlaybackPlayer {
  speed: number
  play: Function
  pause: Function
  replay: Function
  interval: number | null
  intervalIndex: number
  path: Array<Array<number>>
  pointMarker: any
}
