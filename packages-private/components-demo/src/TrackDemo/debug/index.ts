import {
  type Feature,
  type FeatureCollection,
  type GeojsonType,
  type TrackPlaybackPlayer,
  isGeojsonType,
} from './type'

interface TrackItem {
  coordinates: Array<number> // 路径点坐标
  time?: number // 时间戳
}

export interface TrackPlaybackOptions {
  data: Array<TrackItem> | GeojsonType
  pathOptions?: Record<string, any>
}

export interface TrackPlayback {
  map: any
  loca: any
  pathData: Array<TrackItem> | GeojsonType // 轨迹的路线数据
  trackRoute: Array<Array<number>>
  pathLine: any
  pointMarker: any
  show: Function
  hide: Function
}

const AMap = window.AMap
const Loca = (window as any).Loca

/**
 * 播放
 */
function play() {
  if (!this.interval) {
    const animate = () => {
      this.pointMarker.setPosition(this.path[this.intervalIndex])
      this.intervalIndex++
      this.interval = requestAnimationFrame(animate)
    }
    this.interval = requestAnimationFrame(animate)
  }
}

/**
 * 暂停
 */
function pause() {
  if (this.interval) {
    cancelAnimationFrame(this.interval)
    this.interval = null
  }
}

/**
 * 重播
 */
function replay() {
  if (this.interval) {
    cancelAnimationFrame(this.interval)
    this.interval = null
  }
  this.intervalIndex = 0
  this.play()
}

/**
 * 初始化播放器
 */

function initTrackPlaybackPlayer(track: TrackPlayback): TrackPlaybackPlayer {
  const player = {
    speed: 2.0,
    play,
    pause,
    replay,
    interval: null,
    intervalIndex: 0,
    pointMarker: track.pointMarker,
    path: track.trackRoute,
  }
  return player
}

/**
 * 销毁轨迹
 */
function destroyTrack() {
  if (this.pathLine) {
    this.pathLine.destroy()
  }
}

/**
 * 隐藏当前轨迹
 */
function hideTrack() {
  this.pathLine.hide()
}

/**
 * 显示当前轨迹
 */
function showTrack() {
  this.pathLine.show()
}

/** 默认的轨迹样式 */
const defaultPathStyle = {
  color: '#E20000',
  lineWidth: 2,
}

interface TrackPlaybackOptionsFitView {
  immediately?: boolean // 是否立即过渡
  avoid?: Array<number>
}

/**
 * 初始化参数
 */
interface initTrackPlaybackOptions {
  pathOptions?: {
    color?: string | Function
    lineWidth?: number | Function
    borderColor?: string | Function
    borderWidth?: number | Function
    dash?: Array<number> | Function
    altitude?: number | Function
  } // 轨迹配置参数，参考高德: https://lbs.amap.com/api/loca-v2/api#linelayersetstyle
  pointOptions?: {
    iconUrl: string
    iconSize: Array<number>
  }
  fitView?: Boolean | TrackPlaybackOptionsFitView // 是否自动自适应视图
}

function createLineStringGeojson(data: Array<TrackItem>) {
  const json = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: data.map(d => d.coordinates),
        },
        properties: {
          // TODO
        },
      },
    ],
  }
  return json
}

function initTrackPlayback(
  track: TrackPlayback,
  options?: initTrackPlaybackOptions,
) {
  // 一.使用AMap.Polyline实现
  // if(!track.pathLine) {
  //     const { pathOptions, fitView = true } = options
  //     const path = track.pathData.map(p => {
  //         return new AMap.LngLat(p.coordinates[0], p.coordinates[1])
  //     })
  //     track.pathLine = new AMap.Polyline({
  //         path,
  //         ...Object.assign(defaultPathStyle, pathOptions || {})
  //     })
  //     track.map.add(track.pathLine)
  //     // 默认自动适应
  //     if(fitView) {
  //         track.map.setFitView(track.pathLine)
  //     }
  // }
  // 二.使用LineLayer实现
  if (!track.pathLine) {
    const { pathOptions = {}, pointOptions, fitView = true } = options || {}
    const layer = new Loca.LineLayer({
      loca: track.loca,
      visible: true,
      opacity: 1,
    })
    const source = new Loca.GeoJSONSource({
      data: track.pathData,
    })
    layer.setSource(source)
    layer.setStyle({
      ...Object.assign(defaultPathStyle, pathOptions),
    })
    track.pathLine = layer
    const { iconUrl, iconSize } = pointOptions
    let route = null
    if (isGeojsonType(track.pathData)) {
      if ((track.pathData as GeojsonType).type === 'FeatureCollection') {
        route = (track.pathData as FeatureCollection).features[0].geometry
          .coordinates
      } else {
        route = (track.pathData as Feature).geometry.coordinates
      }
    } else {
      route = (track.pathData as Array<TrackItem>).map(item => item.coordinates)
    }
    track.trackRoute = route
    const startPoint = track.trackRoute[0]
    const pointMarker = new AMap.Marker({
      position: startPoint,
      icon: new AMap.Icon({
        size: iconSize,
        image: iconUrl,
        imageSize: [26, 52],
      }),
      anchor: 'bottom-center',
    })
    track.pointMarker = pointMarker
    track.map.add(pointMarker)
  }
}

/**
 * 定义TrackPlayback
 * @param map
 * @param options
 * @returns
 */
function defineTrackPlayback(
  map: any,
  options: TrackPlaybackOptions,
): TrackPlayback {
  const loca = new Loca.Container({
    map,
  })
  const { data } = options
  let pathData: any = data
  if (Array.isArray(data)) {
    pathData = createLineStringGeojson(pathData)
  }
  const track = {
    map,
    loca,
    pathData,
    pathLine: null,
    trackRoute: [],
    pointMarker: null,
    hide: hideTrack,
    show: showTrack,
    destroy: destroyTrack,
  }
  return track
}

export { defineTrackPlayback, initTrackPlayback, initTrackPlaybackPlayer }
