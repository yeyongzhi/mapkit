import {
  BarChartOutlined,
  DesktopOutlined,
  PieChartOutlined,
  RadarChartOutlined,
} from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import { Flex, Layout, Menu } from 'antd'
import './index.scss'
import ShowDemo from './components/basic/show/index'
import ControlDemo from './components/basic/control/index'

const { Header, Footer, Sider, Content } = Layout

const menuItems = [
  {
    key: 'basic',
    label: '基础轨迹回放',
    icon: <RadarChartOutlined />,
    children: [
      { key: 'show', label: '基础轨迹展示' },
      { key: 'control', label: '时间控制' },
      { key: 'more', label: '多轨迹对比' },
      { key: 'update', label: '动态更新' },
    ],
  },
  {
    key: 'history',
    icon: <BarChartOutlined />,
    label: '历史数据分析',
  },
  {
    key: 'dataView',
    icon: <PieChartOutlined />,
    label: '数据可视化',
  },
  {
    key: 'scene',
    icon: <DesktopOutlined />,
    label: '场景应用模块',
  },
]

const AMap = window.AMap

const TrackDemo = () => {
  const [map, setMap] = useState(null)
  const [selectedKeys, setSelectedKeys] = useState(['control'])
  const mapRef = useRef(null)

  const initMap = () => {
    const gapdeMap = new AMap.Map(mapRef.current, {
      center: [120.2, 30.3],
      zoom: 10,
      viewMode: '3D',
    })
    setMap(gapdeMap)
  }

  const handleMenuSelect = ({ item, key, keyPath, selectedKeys }: any) => {
    setSelectedKeys(selectedKeys)
  }

  useEffect(() => {
    console.info('轨迹组件测试demo——初始化')
    initMap()
  }, [])

  return (
    <div className="track_container">
      <Layout>
        <Sider width="200px" collapsible>
          <Menu
            mode="inline"
            items={menuItems}
            theme="dark"
            defaultOpenKeys={['basic']}
            selectedKeys={selectedKeys}
            onSelect={handleMenuSelect}
          />
        </Sider>
        <Content>
          <div className="content_container">
            {map && (
              <div className="handle_container">
                {selectedKeys[0] === 'show' && <ShowDemo map={map} />}
                {selectedKeys[0] === 'control' && <ControlDemo map={map} />}
              </div>
            )}
            <div className="map_container" ref={mapRef}></div>
          </div>
        </Content>
      </Layout>
    </div>
  )
}

export default TrackDemo
