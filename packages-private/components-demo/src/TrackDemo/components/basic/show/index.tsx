import { useEffect, useRef, useState } from 'react'
import { Switch } from 'antd'
import type { CommonProps } from '../../../type'
import { defineTrackPlayback, initTrackPlayback } from '../../index'
import { messageApi } from '../../../../utils/message'

const TrackShowDemo = ({ map }: CommonProps) => {
  const [show, setShow] = useState(false)
  const trackRef = useRef<any>(null)

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
        messageApi.success('轨迹数据获取成功')
        trackRef.current = defineTrackPlayback(map, { data: geojsonData })
        initTrackPlayback(trackRef.current, {
          pathOptions: {
            color: '#E20000',
            lineWidth: 5,
          },
        })
        setShow(true)
      })
  }

  const onChange = (checked: boolean) => {
    if (checked) {
      trackRef.current.show()
    } else {
      trackRef.current.hide()
    }
    setShow(checked)
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
      轨迹是否可见：
      <Switch value={show} onChange={onChange} />
    </div>
  )
}

export default TrackShowDemo
