import { useEffect, useRef, useState } from 'react'
import { Button, Flex } from 'antd'
import type { CommonProps } from '../../../type'
import {
  defineTrackPlayback,
  initTrackPlayback,
  initTrackPlaybackPlayer,
} from '../../index'
import { messageApi } from '../../../../utils/message'
import dayjs from 'dayjs'

const carImgUrl = 'https://a.amap.com/jsapi_demos/static/demo-center-v2/car.png'

const TrackControlDemo = ({ map }: CommonProps) => {
  const trackRef = useRef<any>(null)
  const trackPalyer = useRef<any>(null)

  const initTrack = () => {
    if (trackRef.current) {
      return false
    }
    fetch('https://a.amap.com/amap-ui/static/data/big-routes.json')
      .then(r => r.json())
      .then(res => {
        const geojsonData = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: res[0].path,
              },
              properties: {
                name: '我是测试轨迹',
              },
            },
          ],
        }
        const startTime = dayjs('2025-03-01').valueOf()
        const dataWithTime = res[0].path.map(
          (item: Array<number>, index: number) => {
            return {
              coordinates: item,
              time: startTime + index * 1000,
            }
          },
        )
        // console.log(dataWithTime)
        messageApi.success('轨迹数据获取成功')
        // 初始化轨迹
        trackRef.current = defineTrackPlayback(map, { data: dataWithTime })
        initTrackPlayback(trackRef.current, {
          pathOptions: {
            color: '#1890FF',
            lineWidth: 5,
          },
          pointOptions: {
            iconUrl: carImgUrl,
            iconSize: [26, 52],
          },
        })
        // 初始化轨迹播放器
        trackPalyer.current = initTrackPlaybackPlayer(trackRef.current)
        // console.log(trackPalyer.current)
      })
  }

  const play = () => {
    if (trackPalyer.current) {
      trackPalyer.current.play()
      messageApi.success('开始播放')
    }
  }

  const pause = () => {
    if (trackPalyer.current) {
      trackPalyer.current.pause()
      messageApi.success('暂停播放')
    }
  }

  const replay = () => {
    if (trackPalyer.current) {
      trackPalyer.current.replay()
      messageApi.success('重新播放')
    }
  }

  useEffect(() => {
    initTrack()
    return () => {
      if (trackRef.current) {
        trackRef.current.destroy()
        trackRef.current = null
      }
    }
  }, [])

  return (
    <div>
      <Flex vertical={true} gap={20}>
        <Button type="primary" onClick={play}>
          开始/继续 播放
        </Button>
        <Button onClick={pause}>暂停播放</Button>
        <Button danger onClick={replay}>
          重新播放
        </Button>
      </Flex>
    </div>
  )
}

export default TrackControlDemo
